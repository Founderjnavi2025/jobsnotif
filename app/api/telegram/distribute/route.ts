import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const INTERVAL_MS = 20_000;
const BATCH_LIMIT = 5;
const REST_MS = 10 * 60_000;

type Candidate = {
  id: string;
  full_name: string;
  interests: string[] | null;
  telegram_chat_id: number | null;
  status: string;
  telegram_notifications_enabled: boolean | null;
};

type Job = {
  id: string;
  token: string;
  job_title: string;
  company_name: string;
  status: string;
  job_data: Record<string, unknown> | null;
};

function normalize(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jobKeywords(job: Job): string[] {
  const data = job.job_data ?? {};

  return [
    job.job_title,
    data.department,
    data.industry,
    data.job_level,
    data.employment_type,
  ]
    .map(normalize)
    .filter(Boolean);
}

function matchesInterest(candidate: Candidate, job: Job): boolean {
  const interests = (candidate.interests ?? []).map(normalize);
  const keywords = jobKeywords(job);

  return interests.some((interest) => {
    const selected = interest.split("::").pop()?.trim() ?? interest;

    return keywords.some(
      (keyword) =>
        keyword === selected ||
        keyword.includes(selected) ||
        selected.includes(keyword)
    );
  });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN missing" },
      { status: 503 }
    );
  }

  const now = Date.now();

  const { data: state, error: stateError } = await supabaseAdmin
    .from("job_token_distribution_state")
    .select("*")
    .eq("id", 1)
    .single();

  if (stateError || !state) {
    return NextResponse.json(
      { error: "Distribution state unavailable" },
      { status: 500 }
    );
  }

  if (state.paused_until && new Date(state.paused_until).getTime() > now) {
    return NextResponse.json({
      status: "resting",
      until: state.paused_until,
    });
  }

  if (new Date(state.next_send_at).getTime() > now) {
    return NextResponse.json({
      status: "waiting",
      next_send_at: state.next_send_at,
    });
  }

  const { data: jobs, error: jobsError } = await supabaseAdmin
    .from("jobs")
    .select("id,token,job_title,company_name,status,job_data")
    .eq("status", "published");

  if (jobsError) {
    return NextResponse.json({ error: jobsError.message }, { status: 500 });
  }

  const { data: candidates, error: candidatesError } = await supabaseAdmin
    .from("candidates")
    .select(
      "id,full_name,interests,telegram_chat_id,status,telegram_notifications_enabled"
    )
    .eq("status", "active")
    .eq("telegram_notifications_enabled", true)
    .not("telegram_chat_id", "is", null);

  if (candidatesError) {
    return NextResponse.json(
      { error: candidatesError.message },
      { status: 500 }
    );
  }

  let delivery: {
    id: string;
    candidate_id: string;
    job_id: string;
    token: string;
  } | null = null;

  for (const job of (jobs ?? []) as Job[]) {
    for (const candidate of (candidates ?? []) as Candidate[]) {
      if (!matchesInterest(candidate, job)) continue;

      const { data: existing } = await supabaseAdmin
        .from("job_token_deliveries")
        .select("id")
        .eq("job_id", job.id)
        .eq("candidate_id", candidate.id)
        .maybeSingle();

      if (existing) continue;

      const { data: created, error: insertError } = await supabaseAdmin
        .from("job_token_deliveries")
        .insert({
          job_id: job.id,
          candidate_id: candidate.id,
          token: job.token,
          status: "pending",
        })
        .select("id,candidate_id,job_id,token")
        .maybeSingle();

      if (!insertError && created) {
        delivery = created;
        break;
      }
    }

    if (delivery) break;
  }

  if (!delivery) {
    return NextResponse.json({ status: "queue_empty" });
  }

  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("telegram_chat_id,full_name")
    .eq("id", delivery.candidate_id)
    .single();

  if (!candidate?.telegram_chat_id) {
    await supabaseAdmin
      .from("job_token_deliveries")
      .update({ status: "failed" })
      .eq("id", delivery.id);

    return NextResponse.json({ status: "candidate_chat_missing" });
  }

  const detailUrl = `https://jobs-notif.vercel.app/detail/${encodeURIComponent(
    delivery.token
  )}`;

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: candidate.telegram_chat_id,
        text:
          `Halo ${candidate.full_name}! Ada lowongan yang sesuai minatmu.\n\n` +
          `Lihat detail dan informasi lamaran di sini:\n${detailUrl}`,
      }),
      signal: AbortSignal.timeout(10000),
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.ok) {
    await supabaseAdmin
      .from("job_token_deliveries")
      .update({ status: "failed" })
      .eq("id", delivery.id);

    return NextResponse.json({ status: "telegram_failed" });
  }

  const { error: sentError } = await supabaseAdmin
    .from("job_token_deliveries")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", delivery.id)
    .eq("status", "pending");

  if (sentError) {
    console.error("Delivery record update failed:", sentError.message);
  }

  const nextCount = Number(state.sent_in_batch) + 1;
  const resting = nextCount >= BATCH_LIMIT;

  await supabaseAdmin
    .from("job_token_distribution_state")
    .update({
      sent_in_batch: resting ? 0 : nextCount,
      next_send_at: new Date(now + (resting ? REST_MS : INTERVAL_MS)).toISOString(),
      paused_until: resting
        ? new Date(now + REST_MS).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  return NextResponse.json({
    status: "sent",
    delivery_id: delivery.id,
    batch_count: resting ? 0 : nextCount,
    resting,
  });
}

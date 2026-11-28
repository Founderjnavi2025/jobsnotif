import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data: authData, error: authError } =
      await authClient.auth.getUser(accessToken);

    const user = authData.user;

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (user.user_metadata?.account_type !== "business") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { token } = await context.params;

    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, token, company_id")
      .eq("token", token)
      .eq("company_id", user.id)
      .maybeSingle();

    if (jobError) {
      console.error("Manager HashKeys job lookup:", jobError.message);
      return NextResponse.json(
        { error: "Failed to load vacancy" },
        { status: 500 },
      );
    }

    if (!job) {
      return NextResponse.json({ error: "Vacancy not found" }, { status: 404 });
    }

    const { data: hashkeys, error: hashkeyError } = await supabaseAdmin
      .from("job_hashkeys")
      .select("id, hash_key, tier, status, created_at")
      .eq("job_id", job.id)
      .eq("status", "active")
      .is("candidate_id", null)
      .is("delivery_id", null)
      .is("application_id", null)
      .order("created_at", { ascending: true });

    if (hashkeyError) {
      console.error("Manager HashKeys query:", hashkeyError.message);
      return NextResponse.json(
        { error: "Failed to load HashKeys" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      total: hashkeys?.length || 0,
      hashkeys: hashkeys || [],
    });
  } catch (error) {
    console.error("Manager HashKeys API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

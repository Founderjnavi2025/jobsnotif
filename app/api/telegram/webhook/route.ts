import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";


type TelegramUpdate = {
  update_id?: number;
  message?: {
    text?: string;
    chat?: {
      id?: number;
    };
    from?: {
      id?: number;
      username?: string;
    };
  };
};

export async function POST(request: Request) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!webhookSecret || !botToken) {
    return NextResponse.json(
      { error: "Telegram webhook belum dikonfigurasi." },
      { status: 503 }
    );
  }

  const receivedSecret = request.headers.get(
    "x-telegram-bot-api-secret-token"
  );

  if (receivedSecret !== webhookSecret) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;
    const text = message?.text?.trim() || "";

    console.log("JobsNotif Telegram update:", {
      updateId: update.update_id ?? null,
      command: text.startsWith("/start") ? "/start" : "other",
    });
    const chatId = message?.chat?.id;
    const telegramUserId = message?.from?.id;
    const username = message?.from?.username || null;

    if (!chatId || !telegramUserId) {
      return NextResponse.json({ ok: true });
    }

    if (text === "/start") {
      await sendTelegramMessage(
        botToken,
        chatId,
        "Untuk mengaktifkan akun JobsNotif, silakan buka kembali tautan aktivasi dari halaman pendaftaran."
      );

      return NextResponse.json({ ok: true });
    }

    if (!text.startsWith("/start ")) {
      return NextResponse.json({ ok: true });
    }

    const linkCode = text.slice(7).trim();

    if (!/^[A-Za-z0-9_-]{20,64}$/.test(linkCode)) {
      return NextResponse.json({ ok: true });
    }

    const linkCodeHash = createHash("sha256")
      .update(linkCode)
      .digest("hex");

    const { data: candidate, error: lookupError } =
      await supabaseAdmin
        .from("candidates")
        .select("id")
        .eq("link_code_hash", linkCodeHash)
        .eq("status", "pending_telegram")
        .gt("link_code_expires_at", new Date().toISOString())
        .maybeSingle();

    if (lookupError) {
      console.error("Telegram candidate lookup failed:", lookupError.message);
      return NextResponse.json({ ok: true });
    }

    if (!candidate) {
      await sendTelegramMessage(
        botToken,
        chatId,
        "Kode pendaftaran tidak ditemukan atau sudah kedaluwarsa. Silakan daftar kembali melalui JobsNotif."
      );

      return NextResponse.json({ ok: true });
    }

    const { data: activated, error: activationError } =
      await supabaseAdmin
        .from("candidates")
        .update({
          telegram_user_id: telegramUserId,
          telegram_chat_id: chatId,
          telegram_username: username,
          status: "active",
          linked_at: new Date().toISOString(),
          link_code_hash: null,
          link_code_expires_at: null,
          telegram_notifications_enabled: true,
        })
        .eq("id", candidate.id)
        .eq("status", "pending_telegram")
        .eq("link_code_hash", linkCodeHash)
        .gt("link_code_expires_at", new Date().toISOString())
        .select("id")
        .maybeSingle();

    if (activationError || !activated) {
      console.error(
        "Telegram candidate activation failed:",
        activationError?.message || "Candidate was already activated."
      );

      await sendTelegramMessage(
        botToken,
        chatId,
        "Kode pendaftaran sudah digunakan atau kedaluwarsa. Silakan periksa status pendaftaran Anda."
      );

      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(
      botToken,
      chatId,
      "AKUN ANDA AKTIF.\n\nAnda akan menerima notifikasi lowongan kerja yang sesuai dengan minat pekerjaan Anda."
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook processing failed:", error);

    return NextResponse.json({ ok: true });
  }
}

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string
) {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    console.error("Telegram welcome message failed:", response.status);
  }
}


export async function GET() {
  return NextResponse.json({
    ok: true,
    status: "JobsNotif Telegram webhook is running",
  });
}

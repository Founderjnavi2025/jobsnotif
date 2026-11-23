import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : "";

    const whatsapp =
      typeof body.whatsapp === "string"
        ? body.whatsapp.trim()
        : "";

    const interests = Array.isArray(body.interests)
      ? body.interests.filter(
          (item: unknown): item is string =>
            typeof item === "string" &&
            item.trim().length > 0 &&
            item.length <= 120
        )
      : [];

    if (fullName.length < 2 || fullName.length > 100) {
      return NextResponse.json(
        { error: "Nama lengkap harus 2–100 karakter." },
        { status: 400 }
      );
    }

    if (whatsapp.length > 30) {
      return NextResponse.json(
        { error: "Nomor WhatsApp terlalu panjang." },
        { status: 400 }
      );
    }

    if (interests.length === 0 || interests.length > 30) {
      return NextResponse.json(
        { error: "Pilih 1–30 minat pekerjaan." },
        { status: 400 }
      );
    }

    const linkCode = randomBytes(24).toString("base64url");
    const linkCodeHash = createHash("sha256")
      .update(linkCode)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 20 * 60 * 1000
    ).toISOString();

    const { error } = await supabaseAdmin
      .from("candidates")
      .insert({
        full_name: fullName,
        whatsapp: whatsapp || null,
        interests,
        status: "pending_telegram",
        link_code_hash: linkCodeHash,
        link_code_expires_at: expiresAt,
      });

    if (error) {
      console.error("Candidate registration failed:", error.message);

      return NextResponse.json(
        { error: "Pendaftaran belum berhasil. Coba lagi." },
        { status: 500 }
      );
    }

    const telegramUrl =
      `https://t.me/jobsnotif_job1_bot?start=${linkCode}`;

    return NextResponse.json({
      success: true,
      telegramUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Data pendaftaran tidak valid." },
      { status: 400 }
    );
  }
}

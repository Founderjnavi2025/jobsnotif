import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const token = String(body.token || "").trim();
    const hashKey = String(body.hash_key || "").trim();

    if (!token || !hashKey) {
      return NextResponse.json(
        { valid: false, error: "Token dan HashKey wajib diisi." },
        { status: 400 },
      );
    }

    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, status")
      .eq("token", token)
      .maybeSingle();

    if (jobError) {
      console.error("HashKey check job lookup:", jobError.message);
      return NextResponse.json(
        { valid: false, error: "Gagal memeriksa vacancy." },
        { status: 500 },
      );
    }

    if (!job || job.status !== "published") {
      return NextResponse.json(
        { valid: false, error: "Vacancy tidak menerima lamaran." },
        { status: 400 },
      );
    }

    const { data: key, error: keyError } = await supabaseAdmin
      .from("job_hashkeys")
      .select("id")
      .eq("job_id", job.id)
      .eq("hash_key", hashKey)
      .eq("status", "active")
      .is("application_id", null)
      .maybeSingle();

    if (keyError) {
      console.error("HashKey check query:", keyError.message);
      return NextResponse.json(
        { valid: false, error: "Gagal memeriksa HashKey." },
        { status: 500 },
      );
    }

    if (!key) {
      return NextResponse.json({
        valid: false,
        error: "HashKey salah, sudah digunakan, atau bukan untuk vacancy ini.",
      });
    }

    return NextResponse.json({
      valid: true,
      message: "HashKey valid. Kamu bisa melanjutkan lamaran.",
    });
  } catch (error) {
    console.error("HashKey check API:", error);
    return NextResponse.json(
      { valid: false, error: "Terjadi kesalahan saat memeriksa HashKey." },
      { status: 500 },
    );
  }
}

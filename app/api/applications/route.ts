import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";


const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const token = String(formData.get("token") || "").trim();
    const browserKey = String(formData.get("browser_key") || "").trim();
    const file = formData.get("cv");

    if (!token || !browserKey) {
      return NextResponse.json(
        { error: "Token dan browser key wajib diisi." },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]{20,100}$/.test(browserKey)) {
      return NextResponse.json(
        { error: "Browser key tidak valid." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File CV belum dipilih." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "CV harus berupa PDF." },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran CV maksimal 5 MB." },
        { status: 400 }
      );
    }

    // Cari lowongan berdasarkan token
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, token, status")
      .eq("token", token)
      .maybeSingle();

    if (jobError) {
      console.error("Job lookup:", jobError.message);

      return NextResponse.json(
        { error: "Gagal memeriksa lowongan." },
        { status: 500 }
      );
    }

    if (!job) {
      return NextResponse.json(
        { error: "Token lowongan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (job.status !== "published") {
      return NextResponse.json(
        { error: "Lowongan belum menerima lamaran." },
        { status: 400 }
      );
    }

    // Cek apakah browser ini sudah pernah melamar
    const { data: existing, error: checkError } =
      await supabaseAdmin
        .from("job_applications")
        .select("id")
        .eq("job_id", job.id)
        .eq("browser_key", browserKey)
        .maybeSingle();

    if (checkError) {
      console.error("Duplicate check:", checkError.message);

      return NextResponse.json(
        { error: "Gagal memeriksa riwayat lamaran." },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "Browser ini sudah pernah melamar lowongan ini." },
        { status: 409 }
      );
    }

    const filename = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 100);

    const cvPath = `${job.id}/${randomUUID()}-${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Simpan PDF ke Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("job-cvs")
      .upload(cvPath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload:", uploadError.message);

      return NextResponse.json(
        { error: "Gagal menyimpan CV." },
        { status: 500 }
      );
    }

    // Simpan data lamaran
    const { data: application, error: insertError } =
      await supabaseAdmin
        .from("job_applications")
        .insert({
          job_id: job.id,
          job_token: job.token,
          cv_path: cvPath,
          cv_filename: filename,
          browser_key: browserKey,
        })
        .select("id")
        .single();

    if (insertError) {
      // Hapus file jika data gagal disimpan
      await supabaseAdmin.storage
        .from("job-cvs")
        .remove([cvPath]);

      console.error("Application insert:", insertError.message);

      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Browser ini sudah pernah melamar." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Gagal menyimpan data lamaran." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application_id: application.id,
      message: "CV dan data lamaran berhasil disimpan.",
    });
  } catch (error) {
    console.error("Application API:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan saat upload CV." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import pdfParse from "pdf-parse";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function extractCVData(buffer: Buffer) {
  try {
    const parsed = await pdfParse(buffer);
    const text = (parsed.text || "")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const data: Record<string, string> = {
      full_text: text,
    };

    // PARSER PERTAMA: membaca label eksplisit.
    const labels: Record<string, RegExp[]> = {
      name: [
        /^(?:nama lengkap|nama|full name|candidate name)\s*[:\-]\s*(.+)$/i,
      ],
      whatsapp: [
        /^(?:whatsapp|no\.?\s*(?:hp|handphone)|nomor\s*(?:hp|telepon)|phone|mobile|telephone)\s*[:\-]\s*(.+)$/i,
      ],
      email: [/^(?:email|e-mail|alamat email)\s*[:\-]\s*(.+)$/i],
      education: [
        /^(?:pendidikan|education|educational background)\s*[:\-]\s*(.+)$/i,
      ],
      experience: [
        /^(?:pengalaman kerja|pengalaman|work experience|professional experience)\s*[:\-]\s*(.+)$/i,
      ],
      skills: [/^(?:keahlian|skill|skills|kompetensi)\s*[:\-]\s*(.+)$/i],
      address: [/^(?:alamat|address|domisili)\s*[:\-]\s*(.+)$/i],
    };

    for (const line of lines) {
      for (const [key, patterns] of Object.entries(labels)) {
        if (data[key]) continue;

        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match?.[1]) {
            data[key] = match[1].trim();
            break;
          }
        }
      }
    }

    // PARSER KEDUA: mengambil isi berdasarkan heading CV.
    // Nilai parser pertama tidak akan ditimpa.
    const sectionHeadings: Record<string, RegExp> = {
      summary:
        /^(?:summary|professional summary|profile|profil|about me|objective)$/i,
      education:
        /^(?:education|educational background|pendidikan|academic background)$/i,
      skills:
        /^(?:skills|skills\s*&\s*tools|technical skills|technical skills\s*&\s*tools|keahlian|kompetensi)$/i,
      experience:
        /^(?:work experience|professional experience|experience|pengalaman kerja|pengalaman)$/i,
      organization:
        /^(?:organization(?:al)?(?:\s+and\s+committee)? experience|organizational experience|volunteer experience|organization|organisasi|pengalaman organisasi)$/i,
      projects: /^(?:projects|project experience|proyek)$/i,
      certifications: /^(?:certifications|certificates|sertifikasi)$/i,
      address:
        /^(?:contact|contact information|personal information|alamat|address)$/i,
    };

    const sectionResults: Record<string, string[]> = {};
    let activeSection: string | null = null;

    for (const line of lines) {
      const heading = line
        .replace(/[:：]+$/, "")
        .replace(/\s+/g, " ")
        .trim();

      let matchedSection: string | null = null;

      for (const [key, pattern] of Object.entries(sectionHeadings)) {
        if (pattern.test(heading)) {
          matchedSection = key;
          break;
        }
      }

      if (matchedSection) {
        activeSection = matchedSection;
        sectionResults[activeSection] ||= [];
        continue;
      }

      // Heading umum yang tidak dikenal juga menghentikan section,
      // supaya isi section tidak tercampur dengan bagian berikutnya.
      const looksLikeHeading =
        heading.length <= 65 &&
        /^[A-Z0-9][A-Z0-9 &/(),.-]+$/.test(heading) &&
        !/[.!?]$/.test(heading);

      if (looksLikeHeading && activeSection) {
        activeSection = null;
        continue;
      }

      if (activeSection) {
        sectionResults[activeSection].push(line);
      }
    }

    const sectionText = (key: string) =>
      (sectionResults[key] || []).join("\n").trim();

    const fallbackFields: Record<string, string> = {
      summary: sectionText("summary"),
      education: sectionText("education"),
      skills: sectionText("skills"),
      experience: sectionText("experience"),
      organization: sectionText("organization"),
      projects: sectionText("projects"),
      certifications: sectionText("certifications"),
    };

    for (const [key, value] of Object.entries(fallbackFields)) {
      if (!data[key] && value) {
        data[key] = value;
      }
    }

    // Cari email dari seluruh teks jika belum ditemukan.
    if (!data.email) {
      const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      if (email) data.email = email[0];
    }

    // Cari nomor telepon Indonesia jika belum ditemukan.
    if (!data.whatsapp) {
      const phone = text.match(/(?:\+?62|0)8[\d\s().-]{7,16}\d/);
      if (phone) data.whatsapp = phone[0].trim();
    }

    // Ambil alamat dari baris berlabel jika tersedia.
    if (!data.address) {
      const address = lines.find((line) =>
        /^(?:alamat|address|domisili)\s*[:\-]\s*.+$/i.test(line),
      );
      if (address) {
        data.address = address
          .replace(/^(?:alamat|address|domisili)\s*[:\-]\s*/i, "")
          .trim();
      }
    }

    return data;
  } catch (error) {
    console.error("CV PDF parsing failed:", error);
    return {};
  }
}
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const token = String(formData.get("token") || "").trim();
    const browserKey = String(formData.get("browser_key") || "").trim();
    const file = formData.get("cv");

    if (!token || !browserKey) {
      return NextResponse.json(
        { error: "Token dan browser key wajib diisi." },
        { status: 400 },
      );
    }

    if (!/^[a-zA-Z0-9_-]{20,100}$/.test(browserKey)) {
      return NextResponse.json(
        { error: "Browser key tidak valid." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File CV belum dipilih." },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "CV harus berupa PDF." },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran CV maksimal 5 MB." },
        { status: 400 },
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
        { status: 500 },
      );
    }

    if (!job) {
      return NextResponse.json(
        { error: "Token lowongan tidak ditemukan." },
        { status: 404 },
      );
    }

    if (job.status !== "published") {
      return NextResponse.json(
        { error: "Lowongan belum menerima lamaran." },
        { status: 400 },
      );
    }

    // Cek apakah browser ini sudah pernah melamar
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("job_applications")
      .select("id")
      .eq("job_id", job.id)
      .eq("browser_key", browserKey)
      .maybeSingle();

    if (checkError) {
      console.error("Duplicate check:", checkError.message);

      return NextResponse.json(
        { error: "Gagal memeriksa riwayat lamaran." },
        { status: 500 },
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "Browser ini sudah pernah melamar lowongan ini." },
        { status: 409 },
      );
    }

    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);

    const cvPath = `${job.id}/${randomUUID()}-${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsedCV = await extractCVData(buffer);

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
        { status: 500 },
      );
    }

    // Simpan data lamaran
    const { data: application, error: insertError } = await supabaseAdmin
      .from("job_applications")
      .insert({
        job_id: job.id,
        job_token: job.token,
        cv_path: cvPath,
        cv_filename: filename,
        browser_key: browserKey,
        applicant_name: parsedCV.name || null,
        applicant_whatsapp: parsedCV.whatsapp || null,
        cv_parsed_data: parsedCV,
      })
      .select("id")
      .single();

    if (insertError) {
      // Hapus file jika data gagal disimpan
      await supabaseAdmin.storage.from("job-cvs").remove([cvPath]);

      console.error("Application insert:", insertError.message);

      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Browser ini sudah pernah melamar." },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Gagal menyimpan data lamaran." },
        { status: 500 },
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
      { status: 500 },
    );
  }
}

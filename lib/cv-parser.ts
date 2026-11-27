const pdfParse = require("pdf-parse/lib/pdf-parse.js") as typeof import("pdf-parse");

export async function extractCVData(buffer: Buffer) {
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

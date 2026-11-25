import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const accessToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const authClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

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
      console.error("Manager job lookup:", jobError.message);
      return NextResponse.json({ error: "Failed to load vacancy" }, { status: 500 });
    }

    if (!job) {
      return NextResponse.json({ error: "Vacancy not found" }, { status: 404 });
    }

    const { data: applications, error: applicationError } =
      await supabaseAdmin
        .from("job_applications")
        .select(
          "id, applicant_name, applicant_whatsapp, cv_filename, cv_path, cv_extraction_status, created_at"
        )
        .eq("job_id", job.id)
        .order("created_at", { ascending: false });

    if (applicationError) {
      console.error("Manager applications:", applicationError.message);
      return NextResponse.json(
        { error: "Failed to load applications" },
        { status: 500 }
      );
    }

    const results = await Promise.all(
      (applications || []).map(async (application) => {
        let cvUrl: string | null = null;

        if (application.cv_path) {
          const { data: signed, error: signedError } =
            await supabaseAdmin.storage
              .from("job-cvs")
              .createSignedUrl(application.cv_path, 300);

          if (!signedError) {
            cvUrl = signed.signedUrl;
          }
        }

        return {
          ...application,
          cv_url: cvUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      total: results.length,
      applications: results,
    });
  } catch (error) {
    console.error("Manager applications API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

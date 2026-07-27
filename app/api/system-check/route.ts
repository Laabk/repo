import { getSupabaseAdmin } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Unknown connection error";
}

export async function GET() {
  const checks: Record<string, { ok: boolean; message: string }> = {};

  try {
    const supabase = getSupabaseAdmin();

    const reports = await supabase.from("reports").select("id").limit(1);
    checks.reportsTable = reports.error
      ? { ok: false, message: reports.error.message }
      : { ok: true, message: "Reports table is available." };

    const members = await supabase.from("team_members").select("id").limit(1);
    checks.teamMembersTable = members.error
      ? { ok: false, message: members.error.message }
      : { ok: true, message: "Team members table is available." };

    const buckets = await supabase.storage.listBuckets();
    if (buckets.error) {
      checks.signatureStorage = { ok: false, message: buckets.error.message };
    } else {
      const signatures = buckets.data.find((bucket) => bucket.id === "signatures");
      checks.signatureStorage = signatures
        ? { ok: true, message: "Signatures storage bucket is available." }
        : {
            ok: false,
            message: "The signatures bucket is missing. Run supabase-setup.sql.",
          };
    }
  } catch (error) {
    checks.configuration = { ok: false, message: messageOf(error) };
  }

  const ok = Object.values(checks).every((check) => check.ok);
  return Response.json(
    {
      ok,
      summary: ok
        ? "Supabase is configured correctly."
        : "Supabase setup needs attention. Use the failed check message below.",
      checks,
    },
    { status: ok ? 200 : 503 },
  );
}

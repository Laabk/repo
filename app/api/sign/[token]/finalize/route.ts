import {
  getSupabaseAdmin,
  type MemberRow,
  type ReportRow,
} from "@/app/lib/supabase-server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const supabase = getSupabaseAdmin();
    const { data: reportData, error } = await supabase
      .from("reports")
      .select("*")
      .eq("public_token", token)
      .maybeSingle();
    if (error) throw error;
    if (!reportData) return Response.json({ error: "This signing link is not valid." }, { status: 404 });
    const report = reportData as ReportRow;
    if (report.status === "submitted") return Response.json({ report: { status: "submitted" } });

    const { data: membersData, error: membersError } = await supabase
      .from("team_members")
      .select("*")
      .eq("report_id", report.id);
    if (membersError) throw membersError;
    const missing = (membersData as MemberRow[]).filter((member) => !member.signed_at || !member.signature_key);
    if (missing.length) {
      return Response.json(
        {
          error: `${missing.length} assigned officer${missing.length === 1 ? " has" : "s have"} not signed yet.`,
          missing: missing.map((member) => member.assigned_name),
        },
        { status: 409 },
      );
    }

    const now = Date.now();
    const { error: updateError } = await supabase
      .from("reports")
      .update({ status: "submitted", submitted_at: now, updated_at: now })
      .eq("id", report.id);
    if (updateError) throw updateError;
    return Response.json({ report: { status: "submitted", submittedAt: now } });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not submit the report." },
      { status: 500 },
    );
  }
}

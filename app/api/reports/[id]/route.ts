import {
  getSupabaseAdmin,
  publicMember,
  publicReport,
  type MemberRow,
  type ReportRow,
} from "@/app/lib/supabase-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const supabase = getSupabaseAdmin();
    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (reportError) throw reportError;
    if (!reportData) return Response.json({ error: "Report not found." }, { status: 404 });

    const report = reportData as ReportRow;
    const { data: memberData, error: membersError } = await supabase
      .from("team_members")
      .select("*")
      .eq("report_id", id)
      .order("display_order");
    if (membersError) throw membersError;

    return Response.json({
      report: publicReport(report),
      members: (memberData as MemberRow[]).map((member) => ({
        ...publicMember(member),
        signatureUrl: member.signature_key
          ? `/api/sign/${report.public_token}/signature/${member.id}`
          : null,
      })),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load the report." },
      { status: 500 },
    );
  }
}

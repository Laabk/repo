import {
  getSupabaseAdmin,
  publicMember,
  publicReport,
  type MemberRow,
  type ReportRow,
} from "@/app/lib/supabase-server";
import {
  adminUnauthorizedResponse,
  isAdminRequest,
} from "@/app/lib/admin-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) return adminUnauthorizedResponse();

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

    return Response.json(
      {
        report: publicReport(report),
        members: (memberData as MemberRow[]).map((member) => ({
          ...publicMember(member),
          signatureUrl: member.signature_key
            ? `/api/sign/${report.public_token}/signature/${member.id}`
            : null,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load the report." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) return adminUnauthorizedResponse();

  const { id } = await params;
  try {
    const supabase = getSupabaseAdmin();
    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (reportError) throw reportError;
    if (!reportData) {
      return Response.json({ error: "Report not found." }, { status: 404 });
    }

    const { data: memberData, error: membersError } = await supabase
      .from("team_members")
      .select("signature_key")
      .eq("report_id", id);
    if (membersError) throw membersError;

    const signatureKeys = (memberData ?? [])
      .map((member) => member.signature_key)
      .filter((key): key is string => Boolean(key));

    const { error: deleteError } = await supabase
      .from("reports")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    let warning: string | null = null;
    if (signatureKeys.length) {
      const { error: storageError } = await supabase.storage
        .from("signatures")
        .remove(signatureKeys);
      if (storageError) {
        console.error("[DELETE /api/reports/:id] signature cleanup", storageError);
        warning = "The report was deleted, but some signature files may require storage cleanup.";
      }
    }

    return Response.json({ ok: true, deletedId: id, warning });
  } catch (error) {
    console.error("[DELETE /api/reports/:id]", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not delete the report." },
      { status: 500 },
    );
  }
}

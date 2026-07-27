import {
  getSupabaseAdmin,
  type MemberRow,
  type ReportRow,
} from "@/app/lib/supabase-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; memberId: string }> },
) {
  const { token, memberId } = await params;
  const supabase = getSupabaseAdmin();
  const { data: reportData } = await supabase
    .from("reports")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();
  if (!reportData) return new Response("Not found", { status: 404 });
  const report = reportData as ReportRow;

  const { data: memberData } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", memberId)
    .eq("report_id", report.id)
    .maybeSingle();
  const member = memberData as MemberRow | null;
  if (!member?.signature_key) return new Response("Not found", { status: 404 });

  const { data, error } = await supabase.storage.from("signatures").download(member.signature_key);
  if (error || !data) return new Response("Not found", { status: 404 });
  return new Response(data, {
    headers: { "content-type": "image/png", "cache-control": "private, max-age=60" },
  });
}

import {
  getSupabaseAdmin,
  publicMember,
  type MemberRow,
  type ReportRow,
} from "@/app/lib/supabase-server";

type SignaturePayload = {
  memberId?: string;
  staffNumber?: string;
  designation?: string;
  department?: string;
  phone?: string;
  email?: string;
  consent?: boolean;
  signatureDataUrl?: string;
};

async function getSigningReport(token: string) {
  const supabase = getSupabaseAdmin();
  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!report) return null;
  const { data: members, error: membersError } = await supabase
    .from("team_members")
    .select("*")
    .eq("report_id", report.id)
    .order("display_order");
  if (membersError) throw membersError;
  return { supabase, report: report as ReportRow, members: members as MemberRow[] };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const result = await getSigningReport(token);
    if (!result) return Response.json({ error: "This signing link is not valid." }, { status: 404 });
    return Response.json({
      report: {
        templateId: result.report.template_id,
        title: result.report.title,
        status: result.report.status,
        leadName: result.report.lead_name,
        createdAt: result.report.created_at,
        submittedAt: result.report.submitted_at,
        formData: result.report.form_data,
      },
      members: result.members.map(publicMember),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load this report." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const payload = (await request.json()) as SignaturePayload;
    const result = await getSigningReport(token);
    if (!result) return Response.json({ error: "This signing link is not valid." }, { status: 404 });
    if (result.report.status === "submitted") {
      return Response.json({ error: "This report has already been submitted and locked." }, { status: 409 });
    }
    const member = result.members.find((item) => item.id === payload.memberId);
    if (!member) return Response.json({ error: "Choose your assigned name." }, { status: 400 });
    if (member.signed_at || member.signature_key) {
      return Response.json({ error: `${member.assigned_name}'s signature has already been recorded and is locked.` }, { status: 409 });
    }
    if (!payload.consent) return Response.json({ error: "Signature confirmation is required." }, { status: 400 });
    if (!payload.designation?.trim()) return Response.json({ error: "Enter your designation." }, { status: 400 });

    const match = payload.signatureDataUrl?.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return Response.json({ error: "Draw your signature before saving." }, { status: 400 });
    const binary = Uint8Array.from(Buffer.from(match[1], "base64"));
    if (binary.byteLength > 1_500_000) {
      return Response.json({ error: "The signature image is too large." }, { status: 413 });
    }

    const signatureKey = `${result.report.id}/${member.id}.png`;
    const { error: uploadError } = await result.supabase.storage
      .from("signatures")
      .upload(signatureKey, binary, { contentType: "image/png", upsert: false });
    if (uploadError) throw uploadError;

    const now = Date.now();
    const { error: updateError } = await result.supabase
      .from("team_members")
      .update({
        staff_number: payload.staffNumber?.trim() || null,
        designation: payload.designation.trim(),
        department: payload.department?.trim() || null,
        phone: payload.phone?.trim() || null,
        email: payload.email?.trim() || null,
        signature_key: signatureKey,
        signed_at: now,
        consent_accepted_at: now,
        updated_at: now,
      })
      .eq("id", member.id)
      .is("signed_at", null);
    if (updateError) throw updateError;
    await result.supabase.from("reports").update({ updated_at: now }).eq("id", result.report.id);
    return Response.json({ member: { ...publicMember(member), signed: true, signedAt: now } });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save the signature." },
      { status: 500 },
    );
  }
}

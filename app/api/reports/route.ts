import { formTemplates } from "@/app/lib/form-templates";
import {
  adminUnauthorizedResponse,
  isAdminRequest,
} from "@/app/lib/admin-auth";
import {
  getSupabaseAdmin,
  publicReport,
  type ReportRow,
} from "@/app/lib/supabase-server";

type CreateReportPayload = {
  templateId?: string;
  formData?: Record<string, string | string[]>;
  team?: Array<{ name?: string }>;
};

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return adminUnauthorizedResponse();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return Response.json(
      { reports: (data as ReportRow[]).map(publicReport) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load reports." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateReportPayload;
    const names = (payload.team ?? []).map((member) => member.name?.trim() ?? "").filter(Boolean);
    if (names.length < 1 || names.length > 20) {
      return Response.json({ error: "Add between 1 and 20 inspecting officers." }, { status: 400 });
    }
    const normalized = names.map((name) => name.toLocaleLowerCase());
    if (new Set(normalized).size !== normalized.length) {
      return Response.json({ error: "Each inspecting officer must have a different name." }, { status: 400 });
    }

    const template = formTemplates.find((item) => item.id === payload.templateId);
    if (!template) return Response.json({ error: "Choose a valid inspection form." }, { status: 400 });

    const formData = payload.formData ?? {};
    const facilityName = String(formData.facility_name ?? "").trim();
    if (!facilityName) {
      return Response.json(
        { error: `The ${template.subjectLabel?.toLocaleLowerCase() ?? "facility or institution"} name is required.` },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const publicToken = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
    const now = Date.now();
    const supabase = getSupabaseAdmin();
    const { error: reportError } = await supabase.from("reports").insert({
      id,
      public_token: publicToken,
      template_id: template.id,
      title: `${template.reportPrefix} — ${facilityName}`,
      status: "awaiting_signatures",
      lead_name: process.env.ADMIN_DISPLAY_NAME?.trim() || "Lead Officer",
      lead_email: process.env.SITE_ADMIN_EMAIL?.trim() || null,
      form_data: formData,
      created_at: now,
      updated_at: now,
    });
    if (reportError) {
      throw new Error(`Supabase could not create the report: ${reportError.message}`);
    }

    const { error: membersError } = await supabase.from("team_members").insert(
      names.map((name, index) => ({
        id: crypto.randomUUID(),
        report_id: id,
        display_order: index + 1,
        assigned_name: name,
        updated_at: now,
      })),
    );
    if (membersError) {
      await supabase.from("reports").delete().eq("id", id);
      throw new Error(`Supabase could not save the team roster: ${membersError.message}`);
    }

    return Response.json(
      { report: { id, publicToken, status: "awaiting_signatures" } },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/reports]", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not create report." },
      { status: 500 },
    );
  }
}

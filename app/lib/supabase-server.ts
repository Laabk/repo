import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const hasPlaceholder =
    url?.includes("YOUR_PROJECT") ||
    serviceKey === "YOUR_SERVICE_ROLE_KEY" ||
    serviceKey === "YOUR_NEW_SECRET_KEY";
  if (!url || !serviceKey || hasPlaceholder) {
    throw new Error(
      "Supabase is not configured. Add the real project URL and secret key to .env.local, then restart npm run dev.",
    );
  }
  try {
    new URL(url);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is invalid. Use https://YOUR_PROJECT_ID.supabase.co without /rest/v1/.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type ReportRow = {
  id: string;
  public_token: string;
  template_id: string;
  title: string;
  status: string;
  lead_name: string;
  lead_email: string | null;
  form_data: Record<string, string | string[]>;
  created_at: number;
  updated_at: number;
  submitted_at: number | null;
};

export type MemberRow = {
  id: string;
  report_id: string;
  display_order: number;
  assigned_name: string;
  staff_number: string | null;
  designation: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  signature_key: string | null;
  signed_at: number | null;
  consent_accepted_at: number | null;
  updated_at: number;
};

export function publicReport(row: ReportRow) {
  return {
    id: row.id,
    publicToken: row.public_token,
    templateId: row.template_id,
    title: row.title,
    status: row.status,
    leadName: row.lead_name,
    leadEmail: row.lead_email,
    formData: row.form_data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at,
  };
}

export function publicMember(row: MemberRow) {
  return {
    id: row.id,
    displayOrder: row.display_order,
    assignedName: row.assigned_name,
    staffNumber: row.staff_number,
    designation: row.designation,
    department: row.department,
    phone: row.phone,
    email: row.email,
    signedAt: row.signed_at,
    signed: Boolean(row.signature_key && row.signed_at),
  };
}

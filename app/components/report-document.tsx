"use client";

/* eslint-disable @next/next/no-img-element -- protected signature images are loaded at runtime */

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  FileDown,
  FileText,
  LockKeyhole,
  MapPin,
  Printer,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AdminAccessGate } from "@/app/components/admin-access-gate";
import { AppShell } from "@/app/components/app-shell";
import { type FieldValue } from "@/app/lib/hospitality-form";
import { getFormTemplate } from "@/app/lib/form-templates";

type Member = {
  id: string;
  displayOrder: number;
  assignedName: string;
  staffNumber: string | null;
  designation: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  signedAt: number | null;
  signed: boolean;
  signatureUrl: string | null;
};

type Report = {
  id: string;
  templateId: string;
  publicToken: string;
  title: string;
  status: string;
  leadName: string;
  leadEmail: string | null;
  formData: Record<string, FieldValue>;
  createdAt: number;
  updatedAt: number;
  submittedAt: number | null;
};

export function ReportDocument({ id }: { id: string }) {
  const [report, setReport] = useState<Report | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [authorization, setAuthorization] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function authenticate(enteredAuthorization: string) {
    const response = await fetch(`/api/reports/${id}`, {
      cache: "no-store",
      headers: { Authorization: enteredAuthorization },
    });
    const result = (await response.json()) as {
      report?: Report;
      members?: Member[];
      error?: string;
    };
    if (!response.ok || !result.report) {
      throw new Error(result.error ?? "Could not load this report.");
    }
    setReport(result.report);
    setMembers(result.members ?? []);
    setAuthorization(enteredAuthorization);
    setError("");
  }

  const template = getFormTemplate(report?.templateId);
  const answeredSections = useMemo(() => report ? template.sections.map((section) => ({
    ...section,
    answered: section.fields.filter((field) => {
      const value = report.formData[field.id];
      return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim());
    }),
  })).filter((section) => section.answered.length) : [], [report, template.sections]);

  async function copySigningLink() {
    if (!report) return;
    await navigator.clipboard.writeText(`${window.location.origin}/sign/${report.publicToken}`);
    setNotice("Team signing link copied.");
    window.setTimeout(() => setNotice(""), 2400);
  }

  function downloadCsv() {
    if (!report) return;
    const rows: string[][] = [
      ["Report ID", report.id],
      ["Title", report.title],
      ["Status", report.status],
      ["Lead officer", report.leadName],
      ["Created", new Date(report.createdAt).toISOString()],
      ["Submitted", report.submittedAt ? new Date(report.submittedAt).toISOString() : ""],
      [],
      ["Field", "Answer"],
      ...template.sections.flatMap((section) => section.fields.map((field) => {
        const value = report.formData[field.id];
        return [field.label, Array.isArray(value) ? value.join("; ") : value ?? ""];
      })),
      [],
      ["Assigned officer", "Staff number", "Designation", "Department", "Phone", "Email", "Signed at"],
      ...members.map((member) => [
        member.assignedName,
        member.staffNumber ?? "",
        member.designation ?? "",
        member.department ?? "",
        member.phone ?? "",
        member.email ?? "",
        member.signedAt ? new Date(member.signedAt).toISOString() : "",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!authorization) {
    return (
      <AppShell active="reports">
        <AdminAccessGate onAuthenticate={authenticate} />
      </AppShell>
    );
  }

  if (!report) {
    return <AppShell active="reports"><div className="reports-empty"><AlertTriangle /><h1>Report unavailable</h1><p>{error}</p><Link href="/reports">Back to reports</Link></div></AppShell>;
  }

  const signedCount = members.filter((member) => member.signed).length;

  return (
    <AppShell active="reports">
      <div className="report-page-actions no-print">
        <Link href="/reports"><ArrowLeft />All reports</Link>
        <div>
          <button onClick={copySigningLink} type="button"><Copy />Copy signing link</button>
          <Link href={`/sign/${report.publicToken}`} target="_blank"><ExternalLink />Open signing room</Link>
          <button onClick={downloadCsv} type="button"><FileDown />Download CSV</button>
          <button className="primary" onClick={() => window.print()} type="button"><Printer />Download / print PDF</button>
        </div>
      </div>
      {notice ? <div className="signing-alert success no-print"><CheckCircle2 />{notice}</div> : null}

      <article className="printable-report">
        <header className="print-report-header">
          <div className="report-brand"><span className="brand-symbol"><span /></span><strong>Field Activity<br />Reports</strong></div>
          <div><p>Official field inspection record</p><h1>{template.title}</h1><span>Report ID: {report.id}</span></div>
          <span className={`document-status ${report.status === "submitted" ? "submitted" : ""}`}>{report.status === "submitted" ? <CheckCircle2 /> : <Clock3 />}{report.status === "submitted" ? "Submitted & locked" : "Awaiting signatures"}</span>
        </header>

        <section className="report-overview-grid">
          <div><FileText /><span>{template.subjectLabel ?? "Facility"}<strong>{String(report.formData.facility_name || "Not entered")}</strong></span></div>
          <div><MapPin /><span>Location<strong>{String(report.formData.location || "Not entered")}</strong></span></div>
          <div><Users /><span>Inspecting team<strong>{signedCount} of {members.length} signed</strong></span></div>
          <div><ShieldCheck /><span>Lead officer<strong>{report.leadName}</strong></span></div>
        </section>

        <section className="report-meta-line">
          <span>Created: <strong>{new Date(report.createdAt).toLocaleString("en-GH", { dateStyle: "long", timeStyle: "short" })}</strong></span>
          <span>Last updated: <strong>{new Date(report.updatedAt).toLocaleString("en-GH", { dateStyle: "long", timeStyle: "short" })}</strong></span>
          {report.submittedAt ? <span>Final submission: <strong>{new Date(report.submittedAt).toLocaleString("en-GH", { dateStyle: "long", timeStyle: "short" })}</strong></span> : null}
        </section>

        <div className="report-sections">
          {answeredSections.map((section, index) => (
            <section className="report-document-section" key={section.id}>
              <header><span>{index + 1}</span><div><p>{section.shortTitle}</p><h2>{section.title}</h2></div></header>
              <dl>
                {section.answered.map((field) => {
                  const value = report.formData[field.id];
                  return <div className={field.full ? "full" : ""} key={field.id}><dt>{field.label}</dt><dd>{Array.isArray(value) ? value.join(", ") : value}</dd></div>;
                })}
              </dl>
            </section>
          ))}
        </div>

        <section className="report-signatures-section">
          <header><span><Users /></span><div><p>Inspection team</p><h2>Name and signature of inspecting officers</h2></div></header>
          <div className="signature-records">
            {members.map((member) => (
              <article className={member.signed ? "signed" : ""} key={member.id}>
                <div className="signature-record-head"><span>{member.displayOrder}</span><div><strong>{member.assignedName}</strong><small>{member.designation || "Designation pending"}</small></div>{member.signed ? <LockKeyhole /> : <Clock3 />}</div>
                <dl>
                  <div><dt>Staff number</dt><dd>{member.staffNumber || "—"}</dd></div>
                  <div><dt>Department</dt><dd>{member.department || "—"}</dd></div>
                  <div><dt>Date signed</dt><dd>{member.signedAt ? new Date(member.signedAt).toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short" }) : "Not signed"}</dd></div>
                </dl>
                <div className="signature-image">{member.signatureUrl ? <img src={member.signatureUrl} alt={`${member.assignedName}'s signature`} /> : <span>Signature pending</span>}</div>
              </article>
            ))}
          </div>
        </section>

        <footer className="report-document-footer"><LockKeyhole /><span>This report is versioned. Once finally submitted, its inspection details and signatures are locked against changes.</span></footer>
      </article>
    </AppShell>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FilePlus2,
  FileText,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  PlusCircle,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AdminAccessGate } from "@/app/components/admin-access-gate";
import { AppShell } from "@/app/components/app-shell";

type Report = {
  id: string;
  title: string;
  status: string;
  leadName: string;
  formData: Record<string, string | string[]>;
  createdAt: number;
  submittedAt: number | null;
};

export function ReportsWorkspace() {
  const [reports, setReports] = useState<Report[]>([]);
  const [authorization, setAuthorization] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function authenticate(enteredAuthorization: string) {
    const response = await fetch("/api/reports", {
      cache: "no-store",
      headers: { Authorization: enteredAuthorization },
    });
    const result = (await response.json()) as { reports?: Report[]; error?: string };
    if (!response.ok) {
      throw new Error(result.error ?? "Administrator access could not be verified.");
    }
    setReports(result.reports ?? []);
    setAuthorization(enteredAuthorization);
    setError("");
  }

  async function deleteReport(report: Report) {
    const confirmed = window.confirm(
      `Delete "${report.title}"?\n\nThis permanently removes the report, its team roster and saved signatures. This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(report.id);
    setError("");
    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: "DELETE",
        headers: { Authorization: authorization },
      });
      const result = (await response.json()) as { error?: string; warning?: string | null };
      if (!response.ok) throw new Error(result.error ?? "Could not delete the report.");
      setReports((current) => current.filter((item) => item.id !== report.id));
      if (result.warning) setError(result.warning);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the report.");
    } finally {
      setDeletingId("");
    }
  }

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return reports;
    return reports.filter((report) =>
      [report.title, report.leadName, String(report.formData.location ?? "")]
        .join(" ")
        .toLocaleLowerCase()
        .includes(term),
    );
  }, [query, reports]);

  const submitted = reports.filter((report) => report.status === "submitted").length;
  const awaiting = reports.filter((report) => report.status !== "submitted").length;

  if (!authorization) {
    return (
      <AppShell active="reports">
        <AdminAccessGate onAuthenticate={authenticate} />
      </AppShell>
    );
  }

  return (
    <AppShell active="reports">
      <section className="reports-heading">
        <div><p className="eyebrow">Administrator workspace</p><h1>Field reports</h1><p>View inspections, monitor signatures and export final records.</p></div>
        <div className="reports-heading-actions">
          <button
            className="button button-outline-dark"
            onClick={() => {
              setAuthorization("");
              setReports([]);
              setQuery("");
              setError("");
            }}
            type="button"
          >
            <LockKeyhole />Lock reports
          </button>
          <Link className="button button-primary" href="/#available-forms"><PlusCircle />New inspection</Link>
        </div>
      </section>

      <section className="report-metrics">
        <div><span><FileText /></span><p>All reports<strong>{reports.length}</strong></p></div>
        <div><span className="amber"><Clock3 /></span><p>Awaiting signatures<strong>{awaiting}</strong></p></div>
        <div><span><CheckCircle2 /></span><p>Submitted<strong>{submitted}</strong></p></div>
      </section>

      <section className="reports-panel">
        <div className="reports-toolbar">
          <div><h2>Inspection records</h2><p>Newest reports appear first.</p></div>
          <label><Search /><input aria-label="Search reports" onChange={(event) => setQuery(event.target.value)} placeholder="Search facility or location" value={query} /></label>
        </div>

        {error ? <div className="form-alert">{error}</div> : null}
        {!error && !reports.length ? (
          <div className="reports-empty"><span><FilePlus2 /></span><h3>No field reports yet</h3><p>Choose a checklist, complete the activity report and assign the signing team.</p><Link className="button button-primary" href="/#available-forms"><ClipboardCheck />Choose first form</Link></div>
        ) : null}
        {filtered.length ? (
          <div className="reports-list">
            {filtered.map((report) => (
              <div className="report-row-shell" key={report.id}>
                <Link className="report-row" href={`/reports/${report.id}`}>
                  <span className="report-file-icon"><FileText /></span>
                  <span className="report-main"><strong>{report.title}</strong><small><MapPin />{String(report.formData.location || report.formData.address || "Location not entered")} <i>•</i> Lead: {report.leadName}</small></span>
                  <span className={`report-status ${report.status === "submitted" ? "submitted" : ""}`}>{report.status === "submitted" ? <CheckCircle2 /> : <Users />}{report.status === "submitted" ? "Submitted" : "Awaiting signatures"}</span>
                  <span className="report-date">{new Date(report.createdAt).toLocaleDateString("en-GH", { dateStyle: "medium" })}</span>
                  <ArrowRight className="report-arrow" />
                </Link>
                <button
                  aria-label={`Delete ${report.title}`}
                  className="report-delete-button"
                  disabled={deletingId === report.id}
                  onClick={() => deleteReport(report)}
                  title="Delete report"
                  type="button"
                >
                  {deletingId === report.id ? <LoaderCircle /> : <Trash2 />}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}

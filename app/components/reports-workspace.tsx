"use client";

/* eslint-disable react-hooks/set-state-in-effect -- report data is loaded from the administrator API when the workspace mounts */

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FilePlus2,
  FileText,
  LoaderCircle,
  MapPin,
  PlusCircle,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/reports", { cache: "no-store" });
      const result = (await response.json()) as { reports?: Report[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not load reports.");
      setReports(result.reports ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function deleteReport(report: Report) {
    const confirmed = window.confirm(
      `Delete "${report.title}"?\n\nThis permanently removes the report, its team roster and saved signatures. This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(report.id);
    setError("");
    try {
      const response = await fetch(`/api/reports/${report.id}`, { method: "DELETE" });
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

  return (
    <AppShell active="reports">
      <section className="reports-heading">
        <div><p className="eyebrow">Administrator workspace</p><h1>Field reports</h1><p>View inspections, monitor signatures and export final records.</p></div>
        <Link className="button button-primary" href="/#available-forms"><PlusCircle />New inspection</Link>
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

        {loading ? <div className="reports-loading"><LoaderCircle /><span>Loading reports…</span></div> : null}
        {error ? <div className="form-alert">{error}</div> : null}
        {!loading && !error && !reports.length ? (
          <div className="reports-empty"><span><FilePlus2 /></span><h3>No field reports yet</h3><p>Choose a checklist, complete the activity report and assign the signing team.</p><Link className="button button-primary" href="/#available-forms"><ClipboardCheck />Choose first form</Link></div>
        ) : null}
        {!loading && filtered.length ? (
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

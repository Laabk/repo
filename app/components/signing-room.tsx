"use client";

/* eslint-disable react-hooks/set-state-in-effect, @next/next/no-img-element -- the signing room loads live state on mount and displays a generated data-URL QR */

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Copy,
  Download,
  FileCheck2,
  LockKeyhole,
  QrCode,
  RotateCcw,
  Send,
  Share2,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type FieldValue, type FormSection } from "@/app/lib/hospitality-form";
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
};

type SigningData = {
  report: {
    templateId: string;
    title: string;
    status: string;
    leadName: string;
    createdAt: number;
    submittedAt: number | null;
    formData: Record<string, FieldValue>;
  };
  members: Member[];
};

export function SigningRoom({ token }: { token: string }) {
  const [data, setData] = useState<SigningData | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [finalizing, setFinalizing] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/sign/${token}`, { cache: "no-store" });
      const result = (await response.json()) as SigningData & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not load this signing room.");
      setData(result);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load this signing room.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    const url = `${window.location.origin}/sign/${token}`;
    setShareUrl(url);
    QRCode.toDataURL(url, { width: 360, margin: 2, color: { dark: "#101820", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [load, token]);

  const signedCount = data?.members.filter((member) => member.signed).length ?? 0;
  const allSigned = Boolean(data?.members.length && signedCount === data.members.length);
  const submitted = data?.report.status === "submitted";
  const template = getFormTemplate(data?.report.templateId);
  const selected = data?.members.find((member) => member.id === selectedId);

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setNotice("Shared signing link copied.");
    window.setTimeout(() => setNotice(""), 2500);
  }

  async function shareLink() {
    if (navigator.share) {
      await navigator.share({
        title: data?.report.title ?? "Field activity report",
        text: "Open this report, choose your assigned name and add your signature.",
        url: shareUrl,
      });
    } else {
      await copyLink();
    }
  }

  async function finalize() {
    setFinalizing(true);
    setError("");
    try {
      const response = await fetch(`/api/sign/${token}/finalize`, { method: "POST" });
      const result = (await response.json()) as { error?: string; missing?: string[] };
      if (!response.ok) throw new Error(result.error ?? "The report could not be submitted.");
      setNotice("Report submitted successfully. It is now locked.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The report could not be submitted.");
    } finally {
      setFinalizing(false);
    }
  }

  if (loading) {
    return <div className="signing-loading"><span className="loading-ring" /><strong>Opening field report…</strong></div>;
  }

  if (!data) {
    return (
      <div className="signing-error-page">
        <AlertTriangle />
        <h1>Signing room unavailable</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="signing-page">
      <header className="signing-topbar">
        <Link href="/" aria-label="Field Activity Reports"><ArrowLeft /></Link>
        <div><strong>Field Activity Reports</strong><span>Secure team signing room</span></div>
        <span className={`report-state ${submitted ? "complete" : ""}`}>
          {submitted ? <CheckCircle2 /> : <Clock3 />}{submitted ? "Submitted" : "Awaiting signatures"}
        </span>
      </header>

      <main className="signing-main">
        {error ? <div className="signing-alert error"><AlertTriangle /><span>{error}</span></div> : null}
        {notice ? <div className="signing-alert success"><CheckCircle2 /><span>{notice}</span></div> : null}

        <section className="signing-hero">
          <div className="signing-hero-copy">
            <p className="eyebrow">{template.category}</p>
            <h1>{data.report.title}</h1>
            <p>Prepared by {data.report.leadName} on {new Date(data.report.createdAt).toLocaleDateString("en-GH", { dateStyle: "long" })}</p>
            <div className="sign-progress-summary">
              <strong>{signedCount} of {data.members.length} officers signed</strong>
              <div className="progress-track"><span style={{ width: `${(signedCount / data.members.length) * 100}%` }} /></div>
            </div>
          </div>
          <div className="share-card">
            <div className="qr-frame">
              {qrDataUrl ? <img src={qrDataUrl} alt="QR code for this shared signing room" /> : <QrCode />}
            </div>
            <div>
              <h2>One link for the whole team</h2>
              <p>Everyone opens this same report, then chooses their pre-assigned name.</p>
              <div className="share-actions">
                <button onClick={copyLink} type="button"><Copy />Copy link</button>
                <button onClick={shareLink} type="button"><Share2 />Share</button>
                {qrDataUrl ? <a download="field-report-qr.png" href={qrDataUrl}><Download />QR</a> : null}
              </div>
            </div>
          </div>
        </section>

        <div className="signing-grid">
          <section className="team-signing-card">
            <header className="card-header-row">
              <div><p className="card-kicker">Assigned roster</p><h2>Choose your name to sign</h2></div>
              <span><Users />{signedCount}/{data.members.length}</span>
            </header>
            <p className="identity-note"><ShieldCheck /> Do not choose another officer’s name. Once saved, that person’s slot is permanently locked.</p>
            <div className="member-list">
              {data.members.map((member) => (
                <button
                  className={`member-card ${member.signed ? "signed" : ""} ${selectedId === member.id ? "selected" : ""}`}
                  disabled={member.signed || submitted}
                  key={member.id}
                  onClick={() => { setSelectedId(member.id); setError(""); }}
                  type="button"
                >
                  <span className="member-index">{member.signed ? <Check /> : member.displayOrder}</span>
                  <span className="member-name"><strong>{member.assignedName}</strong><small>{member.signed ? `${member.designation || "Officer"} • signed ${new Date(member.signedAt!).toLocaleString("en-GH")}` : "Not signed — tap to complete your slot"}</small></span>
                  {member.signed ? <LockKeyhole className="member-lock" /> : <UserRound className="member-lock" />}
                </button>
              ))}
            </div>

            {selected && !selected.signed && !submitted ? (
              <SignatureForm
                member={selected}
                onCancel={() => setSelectedId("")}
                onSaved={async () => { setSelectedId(""); setNotice("Signature saved and locked successfully."); await load(); }}
                token={token}
              />
            ) : null}
          </section>

          <aside className="report-preview-card">
            <header className="card-header-row">
              <div><p className="card-kicker">Read-only report</p><h2>Inspection details</h2></div>
              <span><LockKeyhole />Locked</span>
            </header>
            <p className="preview-intro">Review the report prepared by the lead officer before you sign.</p>
            <ReportSummary sections={template.sections} values={data.report.formData} />
          </aside>
        </div>
      </main>

      <footer className="signing-submit-bar">
        <div>
          {submitted ? <FileCheck2 /> : allSigned ? <ClipboardCheck /> : <Clock3 />}
          <span><strong>{submitted ? "Final report submitted" : allSigned ? "All signatures collected" : `${data.members.length - signedCount} signature${data.members.length - signedCount === 1 ? "" : "s"} remaining`}</strong><small>{submitted ? "No further changes are allowed." : allSigned ? "The report is ready for final submission." : "The submit button stays available and unlocks when everyone signs."}</small></span>
        </div>
        <button className="button button-primary" disabled={!allSigned || submitted || finalizing} onClick={finalize} type="button">
          <Send />{submitted ? "Report submitted" : finalizing ? "Submitting…" : "Final submit report"}
        </button>
      </footer>
    </div>
  );
}

function SignatureForm({ member, token, onSaved, onCancel }: { member: Member; token: string; onSaved: () => void; onCancel: () => void }) {
  const [details, setDetails] = useState({ staffNumber: "", designation: "", department: "", phone: "", email: "" });
  const [consent, setConsent] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!details.designation.trim()) { setError("Enter your designation."); return; }
    if (!signatureDataUrl) { setError("Draw your signature in the box."); return; }
    if (!consent) { setError("Confirm that this is your signature."); return; }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/sign/${token}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ memberId: member.id, ...details, consent, signatureDataUrl }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Your signature could not be saved.");
      onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your signature could not be saved.");
      setSaving(false);
    }
  }

  return (
    <div className="signature-form">
      <header><span><UserRound /></span><div><p>Signing as</p><h3>{member.assignedName}</h3></div><LockKeyhole /></header>
      <p className="locked-name-note">Your assigned name is fixed. Complete only the details below that belong to you.</p>
      <div className="signature-fields">
        <label><span>Staff / officer number</span><input value={details.staffNumber} onChange={(event) => setDetails({ ...details, staffNumber: event.target.value })} /></label>
        <label><span>Designation <small>*</small></span><input value={details.designation} onChange={(event) => setDetails({ ...details, designation: event.target.value })} /></label>
        <label><span>Department / unit</span><input value={details.department} onChange={(event) => setDetails({ ...details, department: event.target.value })} /></label>
        <label><span>Phone</span><input inputMode="tel" value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} /></label>
        <label className="full"><span>Email</span><input inputMode="email" value={details.email} onChange={(event) => setDetails({ ...details, email: event.target.value })} /></label>
      </div>
      <SignaturePad onChange={setSignatureDataUrl} />
      <label className="signature-consent">
        <input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" />
        <span>I confirm that I am <strong>{member.assignedName}</strong>, I reviewed the report, and the signature above is mine.</span>
      </label>
      {error ? <div className="inline-error"><AlertTriangle />{error}</div> : null}
      <div className="signature-form-actions">
        <button className="button button-light" disabled={saving} onClick={onCancel} type="button">Cancel</button>
        <button className="button button-primary" disabled={saving} onClick={save} type="button"><LockKeyhole />{saving ? "Saving…" : "Save and lock signature"}</button>
      </div>
    </div>
  );
}

function SignaturePad({ onChange }: { onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const drawn = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const context = canvas.getContext("2d");
    context?.scale(ratio, ratio);
    if (context) {
      context.lineWidth = 2.4;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#142832";
    }
  }, []);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const context = event.currentTarget.getContext("2d");
    const position = point(event);
    context?.beginPath();
    context?.moveTo(position.x, position.y);
    drawing.current = true;
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const context = event.currentTarget.getContext("2d");
    const position = point(event);
    context?.lineTo(position.x, position.y);
    context?.stroke();
    drawn.current = true;
  }

  function end() {
    drawing.current = false;
    if (drawn.current && canvasRef.current) onChange(canvasRef.current.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context?.clearRect(0, 0, canvas.width, canvas.height);
    drawn.current = false;
    onChange("");
  }

  return (
    <div className="signature-pad-wrap">
      <div className="signature-pad-label"><span>Draw your signature <small>*</small></span><button onClick={clear} type="button"><RotateCcw />Clear</button></div>
      <canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} aria-label="Signature drawing area" />
      <small>Use your finger or stylus. Your signature will be locked after saving.</small>
    </div>
  );
}

function ReportSummary({ values, sections }: { values: Record<string, FieldValue>; sections: FormSection[] }) {
  const answeredBySection = useMemo(() => sections.map((section) => ({
    ...section,
    answered: section.fields.filter((field) => {
      const value = values[field.id];
      return Array.isArray(value) ? value.length : value?.trim();
    }),
  })).filter((section) => section.answered.length), [values, sections]);

  return (
    <div className="report-accordion">
      {answeredBySection.map((section, index) => (
        <details key={section.id} open={index === 0}>
          <summary><span>{section.shortTitle}</span><small>{section.answered.length} completed fields</small></summary>
          <dl>
            {section.answered.map((field) => {
              const value = values[field.id];
              return <div key={field.id}><dt>{field.label}</dt><dd>{Array.isArray(value) ? value.join(", ") : value}</dd></div>;
            })}
          </dl>
        </details>
      ))}
    </div>
  );
}

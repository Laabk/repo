"use client";

/* eslint-disable react-hooks/set-state-in-effect -- draft hydration and save status intentionally synchronize with localStorage */

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CloudOff,
  LocateFixed,
  Plus,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  type FieldValue,
  type FormField,
} from "@/app/lib/hospitality-form";
import { getRequiredFieldIds, type FormTemplate } from "@/app/lib/form-templates";

type Draft = {
  values: Record<string, FieldValue>;
  team: Array<{ id: string; name: string }>;
  stage: number;
};

function newMember() {
  return { id: crypto.randomUUID(), name: "" };
}

function hasValue(value: FieldValue | undefined) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim());
}

export function InspectionForm({ template }: { template: FormTemplate }) {
  const sections = template.sections;
  const draftKey = `field-report-${template.id}-draft`;
  const defaultTeamSize = template.defaultTeamSize ?? 2;
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [team, setTeam] = useState<Array<{ id: string; name: string }>>([]);
  const [stage, setStage] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState("Saved on this device");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(draftKey);
    if (stored) {
      try {
        const draft = JSON.parse(stored) as Draft;
        setValues(draft.values ?? {});
        setTeam(
          draft.team?.length
            ? draft.team
            : Array.from({ length: defaultTeamSize }, () => newMember()),
        );
        setStage(Math.min(draft.stage ?? 0, sections.length));
      } catch {
        setTeam(Array.from({ length: defaultTeamSize }, () => newMember()));
      }
    } else {
      const today = new Date();
      const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 10);
      setValues({ inspection_date: localDate });
      setTeam(Array.from({ length: defaultTeamSize }, () => newMember()));
    }
    setHydrated(true);
  }, [defaultTeamSize, draftKey, sections.length]);

  useEffect(() => {
    if (!hydrated) return;
    setSaveState("Saving…");
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(draftKey, JSON.stringify({ values, team, stage }));
      setSaveState("Saved on this device");
    }, 350);
    return () => window.clearTimeout(timer);
  }, [values, team, stage, hydrated, draftKey]);

  const isRosterStage = stage === sections.length;
  const section = sections[Math.min(stage, sections.length - 1)];
  const visibleFields = section.fields.filter(
    (field) =>
      !field.visibleWhen || values[field.visibleWhen.field] === field.visibleWhen.equals,
  );

  const completion = useMemo(() => {
    const allFields = sections.flatMap((item) => item.fields);
    const answered = allFields.filter((field) => hasValue(values[field.id])).length;
    return Math.round((answered / allFields.length) * 100);
  }, [values, sections]);

  function setValue(id: string, value: FieldValue) {
    setError("");
    setValues((current) => ({ ...current, [id]: value }));
  }

  function validateCurrentSection() {
    const missing = visibleFields.filter(
      (field) => field.required && !hasValue(values[field.id]),
    );
    if (!missing.length) return true;
    setError(`Complete ${missing.map((field) => field.label).join(", ")} before continuing.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return false;
  }

  function next() {
    if (!validateCurrentSection()) return;
    setStage((current) => Math.min(current + 1, sections.length));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previous() {
    setStage((current) => Math.max(0, current - 1));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function createSigningRoom() {
    const names = team.map((member) => member.name.trim()).filter(Boolean);
    const missingRequired = getRequiredFieldIds(template).filter((id) => !hasValue(values[id]));
    if (missingRequired.length) {
      setError("Complete the required facility details before creating the signing link.");
      return;
    }
    if (!names.length) {
      setError("Add at least one inspecting officer.");
      return;
    }
    if (new Set(names.map((name) => name.toLocaleLowerCase())).size !== names.length) {
      setError("Each inspecting officer must have a different name.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ templateId: template.id, formData: values, team: names.map((name) => ({ name })) }),
      });
      const result = (await response.json()) as {
        error?: string;
        report?: { publicToken: string };
      };
      if (!response.ok || !result.report) {
        throw new Error(result.error ?? "The signing room could not be created.");
      }
      window.localStorage.removeItem(draftKey);
      window.location.assign(`/sign/${result.report.publicToken}?created=1`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The signing room could not be created.");
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page">
      <header className="form-topbar">
        <Link className="back-link" href="/" aria-label="Back to dashboard">
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div className="form-title-group">
          <strong>{template.title}</strong>
          <span>{isRosterStage ? "Assign inspecting officers" : `Section ${stage + 1} of ${sections.length}`}</span>
        </div>
        <div className="save-state">
          <i aria-hidden="true" />
          <span>{saveState}</span>
        </div>
      </header>

      <div className="inspection-layout">
        <aside className="section-nav" aria-label="Checklist sections">
          <header>
            <strong>Inspection checklist</strong>
            <span>{completion}% of fields completed</span>
          </header>
          <ol>
            {sections.map((item, index) => (
              <li key={item.id}>
                <button
                  className={stage === index ? "active" : ""}
                  onClick={() => setStage(index)}
                  type="button"
                >
                  <span>{index + 1}</span>{item.shortTitle}
                </button>
              </li>
            ))}
            <li>
              <button
                className={isRosterStage ? "active" : ""}
                onClick={() => setStage(sections.length)}
                type="button"
              >
                <span><Users aria-hidden="true" /></span>Assign team
              </button>
            </li>
          </ol>
        </aside>

        <section className="form-section-card">
          {isRosterStage ? (
            <RosterStage team={team} setTeam={setTeam} />
          ) : (
            <>
              <header className="form-section-header">
                <p>Section {stage + 1}</p>
                <h1>{section.title}</h1>
                <span>{section.description}</span>
              </header>
              <div className="form-fields">
                {visibleFields.map((field) => (
                  <FieldInput
                    field={field}
                    key={field.id}
                    value={values[field.id]}
                    values={values}
                    onChange={setValue}
                  />
                ))}
              </div>
            </>
          )}
          {error ? (
            <div className="form-alert" role="alert">
              <AlertTriangle aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}
        </section>
      </div>

      <footer className="form-bottom-bar">
        <div className="progress-wrap">
          <div className="progress-label"><span>Overall completion</span><strong>{completion}%</strong></div>
          <div className="progress-track"><span style={{ width: `${completion}%` }} /></div>
        </div>
        <div className="bottom-actions">
          <button className="button button-light" onClick={previous} disabled={stage === 0} type="button">
            <ArrowLeft aria-hidden="true" /> Previous
          </button>
          {isRosterStage ? (
            <button className="button button-primary" disabled={submitting} onClick={createSigningRoom} type="button">
              {submitting ? <CloudOff aria-hidden="true" /> : <Save aria-hidden="true" />}
              {submitting ? "Creating…" : "Create shared link"}
            </button>
          ) : (
            <button className="button button-primary" onClick={next} type="button">
              Next <ArrowRight aria-hidden="true" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

function FieldInput({
  field,
  value,
  values,
  onChange,
}: {
  field: FormField;
  value?: FieldValue;
  values: Record<string, FieldValue>;
  onChange: (id: string, value: FieldValue) => void;
}) {
  const inputValue = Array.isArray(value) ? "" : value ?? "";
  const className = `field${field.full ? " full" : ""}`;
  const label = <>{field.label}{field.required ? <small> *</small> : null}</>;

  if (field.type === "radio" || field.type === "checkbox") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset className={className}>
        <legend>{label}</legend>
        {field.hint ? <p className="field-hint">{field.hint}</p> : null}
        <div className="choice-group">
          {field.options?.map((option) => (
            <label className="choice" key={option}>
              <input
                checked={field.type === "radio" ? value === option : selected.includes(option)}
                name={field.id}
                onChange={(event) => {
                  if (field.type === "radio") onChange(field.id, option);
                  else {
                    onChange(
                      field.id,
                      event.target.checked
                        ? [...selected, option]
                        : selected.filter((item) => item !== option),
                    );
                  }
                }}
                type={field.type}
                value={option}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.type === "gps") {
    const captured = Boolean(values.latitude && values.longitude);
    return (
      <div className={className}>
        <label>{label}</label>
        <div className="gps-card">
          <div>
            <strong>{captured ? `${values.latitude}, ${values.longitude}` : "No location captured"}</strong>
            <span>{captured ? `Accuracy: ${values.accuracy || "unknown"} metres` : "Stand at the facility and allow location access."}</span>
          </div>
          <button
            onClick={() => {
              if (!navigator.geolocation) return;
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  onChange("latitude", String(position.coords.latitude));
                  onChange("longitude", String(position.coords.longitude));
                  onChange("altitude", String(position.coords.altitude ?? ""));
                  onChange("accuracy", String(Math.round(position.coords.accuracy)));
                  onChange(field.id, "Captured");
                },
                () => onChange(field.id, "Location permission denied"),
                { enableHighAccuracy: true, timeout: 15_000 },
              );
            }}
            type="button"
          >
            <LocateFixed aria-hidden="true" /> {captured ? "Recapture GPS" : "Capture GPS"}
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={className}>
        <label htmlFor={field.id}>{label}</label>
        {field.hint ? <p className="field-hint">{field.hint}</p> : null}
        <textarea
          id={field.id}
          onChange={(event) => onChange(field.id, event.target.value)}
          placeholder={field.placeholder}
          value={inputValue}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className={className}>
        <label htmlFor={field.id}>{label}</label>
        <select id={field.id} onChange={(event) => onChange(field.id, event.target.value)} value={inputValue}>
          <option value="">Select an option</option>
          {field.options?.map((option) => <option key={option}>{option}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={field.id}>{label}</label>
      {field.hint ? <p className="field-hint">{field.hint}</p> : null}
      <input
        id={field.id}
        inputMode={field.type === "number" ? "decimal" : undefined}
        onChange={(event) => onChange(field.id, event.target.value)}
        placeholder={field.placeholder}
        type={field.type}
        value={inputValue}
      />
    </div>
  );
}

function RosterStage({
  team,
  setTeam,
}: {
  team: Array<{ id: string; name: string }>;
  setTeam: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string }>>>;
}) {
  return (
    <>
      <header className="form-section-header roster-header">
        <p>Final setup</p>
        <h1>Assign inspecting officers</h1>
        <span>
          Enter every officer’s name now. One shared link and QR code will be created; each person chooses only their assigned name, adds their details and signs.
        </span>
      </header>
      <div className="roster-body">
        <div className="roster-notice">
          <Users aria-hidden="true" />
          <div><strong>Names become signing slots</strong><span>A signed slot is locked and cannot be replaced or overwritten.</span></div>
        </div>
        <div className="roster-list">
          {team.map((member, index) => (
            <div className="roster-row" key={member.id}>
              <span className="roster-number">{index + 1}</span>
              <div className="field">
                <label htmlFor={`member-${member.id}`}>Officer’s full name</label>
                <input
                  id={`member-${member.id}`}
                  onChange={(event) =>
                    setTeam((current) =>
                      current.map((item) => item.id === member.id ? { ...item, name: event.target.value } : item),
                    )
                  }
                  placeholder="e.g. Ama Mensah"
                  value={member.name}
                />
              </div>
              <button
                className="remove-member"
                disabled={team.length === 1}
                onClick={() => setTeam((current) => current.filter((item) => item.id !== member.id))}
                type="button"
                aria-label={`Remove officer ${index + 1}`}
              >
                <Trash2 aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button
          className="add-member"
          disabled={team.length >= 20}
          onClick={() => setTeam((current) => [...current, newMember()])}
          type="button"
        >
          <Plus aria-hidden="true" /> Add another officer
        </button>
        <div className="sharing-steps">
          <div><span>1</span><strong>Create link</strong><p>The completed inspection becomes read-only.</p></div>
          <div><span>2</span><strong>Share once</strong><p>Show the QR or send the same link to everyone.</p></div>
          <div><span>3</span><strong>Collect signatures</strong><p>Progress updates for the whole team.</p></div>
          <div><span><Check /></span><strong>Final submit</strong><p>Enabled when every assigned officer has signed.</p></div>
        </div>
      </div>
    </>
  );
}

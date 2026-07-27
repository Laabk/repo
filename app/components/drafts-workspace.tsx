"use client";

/* eslint-disable react-hooks/set-state-in-effect -- localStorage drafts are hydrated after the client mounts */

import Link from "next/link";
import { FileClock, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { formTemplates } from "@/app/lib/form-templates";

type SavedDraft = {
  templateId: string;
  title: string;
  slug: string;
  completion: number;
};

export function DraftsWorkspace() {
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);

  function loadDrafts() {
    const found = formTemplates.flatMap((template) => {
      const raw = window.localStorage.getItem(`field-report-${template.id}-draft`);
      if (!raw) return [];
      try {
        const draft = JSON.parse(raw) as { values?: Record<string, string | string[]> };
        const total = template.sections.flatMap((section) => section.fields).length;
        const answered = Object.values(draft.values ?? {}).filter((value) =>
          Array.isArray(value) ? value.length > 0 : Boolean(value?.trim()),
        ).length;
        return [{
          templateId: template.id,
          title: template.title,
          slug: template.slug,
          completion: total ? Math.round((answered / total) * 100) : 0,
        }];
      } catch {
        return [];
      }
    });
    setDrafts(found);
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  return (
    <AppShell active="drafts">
      <section className="welcome-band">
        <div>
          <p className="eyebrow">Saved on this device</p>
          <h1>Continue your drafts</h1>
          <p>Unfinished forms save automatically and can be continued later.</p>
        </div>
      </section>

      <section className="workspace-panel">
        {drafts.length ? (
          <div className="available-form-list">
            {drafts.map((draft) => (
              <div className="draft-list-item" key={draft.templateId}>
                <Link href={`/inspections/${draft.slug}`}>
                  <span><FileClock /></span>
                  <div>
                    <strong>{draft.title}</strong>
                    <small>{draft.completion}% completed — tap to continue</small>
                  </div>
                </Link>
                <button
                  aria-label={`Delete ${draft.title} draft`}
                  onClick={() => {
                    window.localStorage.removeItem(`field-report-${draft.templateId}-draft`);
                    loadDrafts();
                  }}
                  type="button"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span><FileClock /></span>
            <h2>No saved drafts</h2>
            <p>When you start a form, your progress will save automatically here.</p>
            <Link href="/">Choose a form</Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}

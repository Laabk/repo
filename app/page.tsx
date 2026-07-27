import Link from "next/link";
import { ArrowRight, ClipboardCheck, PlusCircle, QrCode } from "lucide-react";
import { AppShell } from "./components/app-shell";
import { TimeGreeting } from "./components/time-greeting";
import { formTemplates } from "@/app/lib/form-templates";

export default function Home() {
  return (
    <AppShell active="forms">
      <section className="welcome-band">
        <div>
          <p className="eyebrow">Field operations workspace</p>
          <h1><TimeGreeting /></h1>
          <p>No account is required. Start a new form or continue a saved draft.</p>
        </div>
        <div className="welcome-actions">
          <Link className="button button-primary" href="#available-forms">
            <PlusCircle aria-hidden="true" />
            Start new form
          </Link>
          <Link className="button button-outline-dark" href="/drafts">
            <QrCode aria-hidden="true" />
            Continue a draft
          </Link>
        </div>
      </section>

      <section className="workspace-panel" aria-label="Available field forms">
        <div className="dashboard-grid single-column">
          <article className="form-launch-card" id="available-forms">
            <div className="form-card-heading">
              <span className="large-icon"><ClipboardCheck aria-hidden="true" /></span>
              <div>
                <p className="card-kicker">Available forms</p>
                <h2>Choose the appropriate checklist</h2>
                <p>{formTemplates.length} forms <span>•</span> Auto-save <span>•</span> Shared team signing</p>
              </div>
            </div>

            <div className="available-form-list">
              {formTemplates.map((template) => (
                <Link href={`/inspections/${template.slug}`} key={template.id}>
                  <span><ClipboardCheck /></span>
                  <div>
                    <strong>{template.title}</strong>
                    <small>{template.sections.length} sections • {template.description}</small>
                  </div>
                  <ArrowRight />
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </AppShell>
  );
}

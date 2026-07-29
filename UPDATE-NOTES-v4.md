# Field Activity Reports — Form and Admin Delete Update

## What this update adds

- Quality Assurance Checklist — EA1 Renewal Applications
- Regional Quality Assurance Checklist — EIA Applications
- Pesticides Quality Assurance Checklist — EIA Applications
- EIA Technical Committee Approval Sheet
- An administrator-only Delete button beside every report
- A confirmation warning before a report is permanently deleted
- Cleanup of the deleted report's team roster and stored signature images

The four new forms use the existing workflow:

1. Choose a form without logging in.
2. Complete it while the device saves the draft automatically.
3. Enter the assigned team members' names.
4. Create and share one signing link or QR code.
5. Each named member completes their own details and signature.
6. Submit the completed report.
7. The administrator logs in through Reports to view, export or delete it.

## Files changed

Copy these files into the same relative locations in the cloned GitHub
repository:

- `app/lib/form-templates.ts`
- `app/components/hospitality-inspection-form.tsx`
- `app/api/reports/route.ts`
- `app/api/reports/[id]/route.ts`
- `app/components/report-document.tsx`
- `app/components/reports-workspace.tsx`
- `app/globals.css`
- `proxy.ts`
- `README.md`
- `UPDATE-NOTES-v4.md`

## Database and Vercel compatibility

- No new environment variables are required.
- No Supabase migration is required when the existing `supabase-setup.sql`
  was already run.
- The existing `team_members.report_id` cascade removes roster records when a
  report is deleted.
- The delete endpoint is protected by the same administrator credentials as
  the Reports pages.
- Forms, drafts, report creation and public team-signing links remain open
  without login.

## Validate locally

```powershell
npm install
npm run lint
npm run build
npm run dev
```

Open `http://localhost:3000` and confirm that eight forms are listed. Test one
of the new forms, then open Reports and test deletion using a disposable test
report.

## Push and deploy

```powershell
git status
git add .
git commit -m "Add QA forms and admin report deletion"
git push origin HEAD
```

Vercel will build the new GitHub commit automatically. The existing production
deployment remains available until the new deployment finishes successfully.

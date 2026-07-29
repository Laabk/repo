# Field Activity Reports — Every-Visit Report Login Update

## Behaviour after this update

- Clicking Reports always opens the administrator login screen.
- Refreshing Reports immediately locks it and asks for login again.
- Clicking Reports again asks for login again.
- Opening an individual report asks for login again.
- Returning from an individual report to the report list asks for login again.
- Clicking **Lock reports** immediately removes current access.
- The browser does not store report access in cookies, local storage or session
  storage.
- Protected report APIs reject report viewing and deletion unless the current
  request includes the correct administrator credentials.
- Forms, drafts, report creation and team-signing links remain open without
  user accounts.

## Files changed in this security update

Copy these files into the same relative locations in the cloned GitHub
repository:

- `app/lib/admin-auth.ts` (new)
- `app/components/admin-access-gate.tsx` (new)
- `app/components/reports-workspace.tsx`
- `app/components/report-document.tsx`
- `app/api/reports/route.ts`
- `app/api/reports/[id]/route.ts`
- `app/globals.css`
- `proxy.ts`
- `README.md`
- `UPDATE-NOTES-v5.md` (new)

## Compatibility

- No Supabase SQL changes are required.
- No new Vercel environment variables are required.
- Keep using `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
- The four new quality-assurance/EIA forms and the report Delete button remain
  included.

## Validate locally

```powershell
npm install
npm run lint
npm run build
npm run dev
```

Test the following:

1. Click Reports and enter the correct credentials.
2. Refresh the page and confirm that the login screen returns.
3. Enter the credentials, open a report and confirm it asks again.
4. Try an incorrect password and confirm no report data appears.
5. Test the Delete button with a disposable report.

## Push to GitHub

```powershell
git status
git add .
git commit -m "Require report login on every visit"
git push origin HEAD
```

Vercel will build the pushed commit automatically.

# Field Activity Reports — Local and Vercel Version

This is a mobile-friendly field inspection system with four forms:

- Hospitality Industry Site Verification
- Petroleum Retail Outlet / LPG Refilling Plant
- Existing Health Institution Environmental Permit
- General Construction Screening

The lead officer completes a form and enters the team roster. The app creates one
shared link and QR code. Team members do not create accounts: each person chooses
their assigned name, enters their details and signs on their phone. A completed
signature slot locks, and the report can be finally submitted after everyone signs.
The dashboard greeting follows the visitor's local time without displaying a
personal name. Forms and drafts remain open; clicking **Reports** immediately
starts the administrator username/password challenge.

## What you need

1. Node.js 20 or newer: <https://nodejs.org/>
2. A free Supabase account: <https://supabase.com/>
3. A free Vercel account: <https://vercel.com/>

## 1. Create the database

1. Create a new project in Supabase.
2. Open **SQL Editor**.
3. Open `supabase-setup.sql` from this project.
4. Copy all its contents into the SQL Editor and click **Run**.
5. In Supabase, open **Project Settings → API**.
6. Copy the **Project URL** and **service_role key**. Keep the service-role key private.

## 2. Configure the project locally

Open this project in VS Code. In the project folder, create a file named
`.env.local` and copy the following into it:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose-a-strong-password
SITE_ADMIN_EMAIL=your-email@example.com
ADMIN_DISPLAY_NAME=David
```

Replace every sample value with your real information. Never upload `.env.local`
or share the service-role key.

## 3. Run on Windows

Open the VS Code terminal in the project folder and run:

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. The home page, forms, local drafts, and shared
signing links do not require an account. The browser asks for the administrator
username and password from `.env.local` only when **Reports** is opened.

Before submitting a form, open <http://localhost:3000/api/system-check>. It safely
checks the Supabase connection, required tables, and signature bucket without
displaying the private key. Every check should report `"ok": true`.

To test the team workflow, create a report, copy its shared signing link, and open
that link in an Incognito/InPrivate window or on another phone. The shared signing
page does not require the administrator password.

## 4. Host on Vercel

### Recommended: GitHub

1. Create a new GitHub repository.
2. Upload this project, but do not upload `.env.local` or `node_modules`.
3. In Vercel, click **Add New → Project** and import the GitHub repository.
4. Keep **Framework Preset** as **Next.js**.
5. Add these environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SITE_ADMIN_EMAIL`
   - `ADMIN_DISPLAY_NAME`
6. Click **Deploy**.

After deployment, open the Vercel address and test one complete report with
temporary names and signatures before using real field data.

## Security notes

- Only **Reports** and its report-viewing data are password-protected.
- Team signing links intentionally require no account.
- Anyone who has a signing link can select an unsigned name, so share links only
  with the assigned team.
- Use a long administrator password and never expose the Supabase service-role key.

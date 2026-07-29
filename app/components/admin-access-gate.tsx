"use client";

import {
  AlertTriangle,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { FormEvent, useState } from "react";

function createAuthorization(username: string, password: string) {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `Basic ${window.btoa(binary)}`;
}

export function AdminAccessGate({
  onAuthenticate,
}: {
  onAuthenticate: (authorization: string) => Promise<void>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter both the administrator username and password.");
      return;
    }

    setChecking(true);
    setError("");
    try {
      await onAuthenticate(createAuthorization(username.trim(), password));
      setPassword("");
    } catch (caught) {
      setPassword("");
      setError(
        caught instanceof Error
          ? caught.message
          : "Administrator access could not be verified.",
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="admin-access-gate" aria-labelledby="admin-access-title">
      <form className="admin-login-card" onSubmit={submit}>
        <header>
          <span><ShieldCheck aria-hidden="true" /></span>
          <div>
            <p>Protected administrator area</p>
            <h1 id="admin-access-title">Sign in to view reports</h1>
          </div>
        </header>

        <div className="admin-security-note">
          <LockKeyhole aria-hidden="true" />
          <p>
            Access is temporary. You must enter the password again whenever
            Reports is opened, refreshed or revisited.
          </p>
        </div>

        <label>
          <span>Administrator username</span>
          <div>
            <UserRound aria-hidden="true" />
            <input
              autoComplete="username"
              autoFocus
              disabled={checking}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              value={username}
            />
          </div>
        </label>

        <label>
          <span>Administrator password</span>
          <div>
            <KeyRound aria-hidden="true" />
            <input
              autoComplete="current-password"
              disabled={checking}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              type="password"
              value={password}
            />
          </div>
        </label>

        {error ? (
          <div className="admin-login-error" role="alert">
            <AlertTriangle aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        <button disabled={checking} type="submit">
          <LockKeyhole aria-hidden="true" />
          {checking ? "Checking access…" : "Unlock reports"}
        </button>

        <small>
          Credentials are checked securely and are not saved in this browser.
        </small>
      </form>
    </section>
  );
}

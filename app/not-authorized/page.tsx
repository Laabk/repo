import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";

export default function NotAuthorizedPage() {
  return (
    <main className="access-denied">
      <span><LockKeyhole /></span>
      <p className="eyebrow">Administrator access</p>
      <h1>This workspace belongs to the report administrator.</h1>
      <p>Team members do not need this dashboard. Please use the shared report link or QR code provided by the lead officer.</p>
      <Link className="button button-primary" href={chatGPTSignOutPath("/")}>Use another administrator account</Link>
    </main>
  );
}

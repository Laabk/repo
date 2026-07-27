"use client";

import Link from "next/link";
import {
  CircleHelp,
  Cloud,
  FileClock,
  FileText,
  Home,
  RefreshCcw,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

const navigation = [
  { id: "forms", label: "Forms", href: "/", icon: Home },
  { id: "drafts", label: "Drafts", href: "/drafts", icon: FileClock },
  { id: "reports", label: "Reports", href: "/reports", icon: FileText },
];

export function AppShell({
  children,
  active,
}: {
  children: ReactNode;
  active: string;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand-mark" href="/" aria-label="Field Activity Reports home">
          <span className="brand-symbol" aria-hidden="true"><span /></span>
          <span>Field Activity<br />Reports</span>
        </Link>
        <nav aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </>
            );
            if (item.id === "reports") {
              return (
                <a
                  key={item.id}
                  className={active === item.id ? "active" : ""}
                  href={item.href}
                >
                  {content}
                </a>
              );
            }
            return (
              <Link
                key={item.id}
                className={active === item.id ? "active" : ""}
                href={item.href}
              >
                {content}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/sync"><RefreshCcw /><span>Sync</span></Link>
          <Link href="/settings"><Settings /><span>Settings</span></Link>
          <Link href="/help"><CircleHelp /><span>Help</span></Link>
        </div>
      </aside>

      <div className="app-frame">
        <header className="topbar">
          <Link className="mobile-brand" href="/">Field Activity Reports</Link>
          <div className="topbar-spacer" />
          <div className="sync-status">
            <Cloud aria-hidden="true" />
            <span><strong>Sync status</strong><small>All up to date</small></span>
            <i aria-label="Synced">✓</i>
          </div>
          <div className="user-menu">
            <span className="avatar"><ShieldCheck aria-hidden="true" /></span>
            <span><strong>Form access</strong><small>No login required</small></span>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>

      <nav className="mobile-navigation" aria-label="Mobile navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </>
          );
          if (item.id === "reports") {
            return (
              <a key={item.id} className={active === item.id ? "active" : ""} href={item.href}>
                {content}
              </a>
            );
          }
          return (
            <Link key={item.id} className={active === item.id ? "active" : ""} href={item.href}>
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

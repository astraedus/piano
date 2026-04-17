"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { JustPlayButton } from "./JustPlayButton";

export function AppShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  const path = usePathname();
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && (
        <header className="no-print sticky top-0 z-20 bg-[color:var(--background)]/90 backdrop-blur border-b border-[color:var(--rule)]">
          <nav className="max-w-3xl mx-auto px-5 h-14 flex items-center gap-6">
            <Link href="/" className="font-serif text-[color:var(--ink)] text-lg tracking-tight">
              piano
            </Link>
            <div className="flex items-center gap-5 text-sm text-[color:var(--ink-3)]">
              <NavLink href="/tree" active={path?.startsWith("/tree")}>the tree</NavLink>
              <NavLink href="/timeline" active={path?.startsWith("/timeline")}>timeline</NavLink>
              <NavLink href="/settings" active={path?.startsWith("/settings")}>settings</NavLink>
            </div>
            <div className="ml-auto">
              <JustPlayButton />
            </div>
          </nav>
        </header>
      )}
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-6">{children}</main>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={
        "transition-colors " +
        (active
          ? "text-[color:var(--ink)]"
          : "hover:text-[color:var(--ink-2)]")
      }
    >
      {children}
    </Link>
  );
}

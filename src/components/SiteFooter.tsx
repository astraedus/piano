import Link from "next/link";
import { BUILDER, ISSUES_URL, REPO_URL, SITE_TAGLINE } from "@/lib/seo";

/**
 * The site's crawlable footer. Two jobs, both load-bearing:
 *
 *  1. **Internal linking.** Every app route is a client-hydrated shell, so the
 *     only server-rendered prose a crawler reliably sees on `/tree` or `/timeline`
 *     is this footer. It is what connects the app routes to the marketing pages
 *     that actually carry the content, so those pages get discovered and get
 *     link equity instead of sitting orphaned.
 *  2. **Feedback affordance.** The one place, on every screen, where somebody who
 *     just hit a rough edge can say so. Free and open source only works as a
 *     promise if the way back to the author is always visible.
 *
 * No hooks: it renders identically inside the client `AppShell` and inside the
 * server-rendered marketing shell, so there is exactly one footer in the codebase.
 */
export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-[color:var(--bg-rule)] bg-[color:var(--bg-surface)]/40">
      <div className="shell-container w-full px-5 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <p className="font-serif text-[length:var(--text-xl)] text-[color:var(--ink)] tracking-[-0.02em]">
              Music Practice
            </p>
            <p className="text-sm text-[color:var(--ink-2)] leading-relaxed">{SITE_TAGLINE}</p>
          </div>

          <FooterColumn title="Instruments">
            <FooterLink href="/piano">Piano</FooterLink>
            <FooterLink href="/guitar">Electric guitar</FooterLink>
            <FooterLink href="/drums">Drums</FooterLink>
          </FooterColumn>

          <FooterColumn title="The app">
            <FooterLink href="/">Practice stand</FooterLink>
            <FooterLink href="/tree">The skill tree</FooterLink>
            <FooterLink href="/timeline">Timeline</FooterLink>
            <FooterLink href="/settings">Settings</FooterLink>
          </FooterColumn>

          <FooterColumn title="Project">
            <FooterLink href="/about">About this app</FooterLink>
            <FooterLink href={REPO_URL} external>
              Source on GitHub
            </FooterLink>
            <FooterLink href={ISSUES_URL} external>
              Send feedback or report a bug
            </FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-8 border-t border-[color:var(--bg-rule)] pt-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <p className="text-xs text-[color:var(--ink-3)]">
            Free and open source, MIT licensed. Built by {BUILDER}.
          </p>
          <p className="text-xs text-[color:var(--ink-3)] sm:ml-auto">
            Something confusing or broken?{" "}
            <a
              href={ISSUES_URL}
              className="text-[color:var(--accent-deep)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open an issue
            </a>
            . Feedback is genuinely wanted.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-3)]">{title}</h2>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className = "text-sm text-[color:var(--ink-2)] hover:text-[color:var(--ink)] transition-colors";
  return (
    <li>
      {external ? (
        <a href={href} className={className} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    </li>
  );
}

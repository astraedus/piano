import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="max-w-md text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)]">Page Not Found</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]">Nothing here.</h1>
        <p className="text-[color:var(--ink-2)] italic font-serif">This page doesn't exist. Let's head back.</p>
        <p><Link href="/" className="text-[color:var(--accent)] hover:underline">Back to the Stand</Link></p>
      </div>
    </div>
  );
}

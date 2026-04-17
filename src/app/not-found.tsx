import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="max-w-md text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)]">off the path</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]">a quiet room, unused.</h1>
        <p className="text-[color:var(--ink-2)] italic font-serif">nothing lives here. head back.</p>
        <p><Link href="/" className="text-[color:var(--accent)] hover:underline">to the stand</Link></p>
      </div>
    </div>
  );
}

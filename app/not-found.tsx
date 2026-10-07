import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6">
      <p className="text-xs tracking-[0.18em] text-[#a78bfa]">NEXUS</p>
      <h1 className="mt-3 text-3xl font-semibold">This page is not in the workspace.</h1>
      <p className="mt-3 text-sm leading-6 text-muted">The link may be out of date. The product still opens from For You.</p>
      <Link href="/app/for-you" className="mt-6 inline-flex min-h-11 items-center text-sm text-[#c4b5fd]">
        Open Nexus
      </Link>
    </main>
  );
}

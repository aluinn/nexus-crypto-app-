import Link from "next/link";

export function FinalCta() {
  return (
    <section className="px-4 py-24 sm:px-6" aria-labelledby="cta-heading">
      <div className="relative mx-auto max-w-3xl text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-[min(520px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(130,92,237,0.2),transparent_70%)]"
        />
        <h2 id="cta-heading" className="relative text-4xl font-semibold tracking-tight sm:text-5xl">
          See the whole picture.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
          One place for your portfolio, market intelligence, research and investment decisions.
        </p>
        <Link
          href="/app/for-you"
          className="relative mt-8 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-bright"
        >
          Open Nexus
        </Link>
      </div>
    </section>
  );
}

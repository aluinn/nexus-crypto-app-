export function About() {
  return (
    <section id="about" className="px-4 py-16 sm:px-6" aria-labelledby="about-heading">
      <div className="mx-auto grid max-w-6xl gap-8 rounded-3xl border border-white/10 bg-panel p-6 sm:p-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-muted">ABOUT</p>
          <h2 id="about-heading" className="mt-3 text-3xl font-semibold tracking-tight">
            One workspace for the way you actually invest.
          </h2>
        </div>
        <div className="space-y-4 text-sm leading-7 text-muted">
          <p>
            Nexus is an investment intelligence platform for digital-asset investors. It gathers portfolio tracking, market news, saved research, and a personal journal.
          </p>
          <p>
            Prices come from public market data when a GBP quote is available. News excerpts come from publisher RSS feeds and always link back to the original story.
          </p>
          <p>
            Information in Nexus is for organisation and reference. It is not financial advice, and Nexus does not connect to an exchange account or place trades.
          </p>
        </div>
      </div>
    </section>
  );
}

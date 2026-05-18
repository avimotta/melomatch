const featured = [
  {
    name: "Luna Martinez",
    instrument: "Piano / Keys",
    location: "Brooklyn, NY",
    tags: ["Jazz", "Neo-Soul", "Lo-Fi"],
  },
  {
    name: "David Kim",
    instrument: "Bass Guitar",
    location: "Los Angeles, CA",
    tags: ["Funk", "Rock", "R&B"],
  },
  {
    name: "Sofia Torres",
    instrument: "Violin",
    location: "Austin, TX",
    tags: ["Classical", "Folk", "Experimental"],
  },
  {
    name: "Marcus Webb",
    instrument: "Producer / Beatmaker",
    location: "Atlanta, GA",
    tags: ["Hip-Hop", "Electronic", "Trap"],
  },
  {
    name: "Emma Larsson",
    instrument: "Singer-Songwriter",
    location: "Nashville, TN",
    tags: ["Folk", "Country", "Acoustic"],
  },
  {
    name: "Ravi Patel",
    instrument: "Tabla / Percussion",
    location: "Toronto, ON",
    tags: ["World", "Fusion", "Electronic"],
  },
];

export default function FeaturedMusicians() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      {/* Section header */}
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Featured
        </span>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Musicians Near You
        </h2>
        <p className="mt-4 text-muted">
          Talented musicians looking to collaborate. Find your perfect match.
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((m) => (
          <a
            key={m.name}
            href="#"
            className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-border hover:bg-surface-hover hover:shadow-lg hover:shadow-black/20"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-lg font-bold text-accent">
                {m.name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-foreground">
                  {m.name}
                </h3>
                <p className="truncate text-sm text-muted">{m.instrument}</p>
                <p className="mt-0.5 text-xs text-muted/70">{m.location}</p>
              </div>

              <span className="mt-1 text-muted/50 transition-all group-hover:translate-x-0.5 group-hover:text-foreground">
                →
              </span>
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {m.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>

      {/* View all */}
      <div className="mt-10 text-center">
        <a
          href="/discover"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-all hover:gap-3"
        >
          View all musicians
          <span>→</span>
        </a>
      </div>
    </section>
  );
}

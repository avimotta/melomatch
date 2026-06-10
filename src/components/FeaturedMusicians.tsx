import Link from "next/link";
import Avatar from "@/components/Avatar";

const featured = [
  {
    name: "Luna Martinez",
    instrument: "Piano / Keys",
    location: "Brooklyn, NY",
  },
  {
    name: "David Kim",
    instrument: "Bass Guitar",
    location: "Los Angeles, CA",
  },
  {
    name: "Sofia Torres",
    instrument: "Violin",
    location: "Austin, TX",
  },
  {
    name: "Marcus Webb",
    instrument: "Producer / Beatmaker",
    location: "Atlanta, GA",
  },
  {
    name: "Emma Larsson",
    instrument: "Singer-Songwriter",
    location: "Nashville, TN",
  },
  {
    name: "Ravi Patel",
    instrument: "Tabla / Percussion",
    location: "Toronto, ON",
  },
];

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default function FeaturedMusicians() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      {/* Section header */}
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block label">
          Featured
        </span>
        <h2 className="heading text-3xl sm:text-4xl">
          Musicians Near You
        </h2>
        <p className="mt-4 text-muted">
          Talented musicians looking to collaborate. Build your network.
        </p>
      </div>

      {/* Grid — dashboard-style cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {featured.map((m) => (
          <Link
            key={m.name}
            href="#"
            className="group"
          >
            <div className="aspect-square overflow-hidden rounded-xl bg-linear-to-br from-accent-secondary/15 to-surface-elevated transition-all group-hover:ring-2 group-hover:ring-accent-secondary/30">
              <Avatar
                avatarUrl={null}
                id={m.name.toLowerCase().replace(/\s+/g, "-")}
                alt={m.name}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-2 truncate text-xs font-medium text-foreground group-hover:text-accent-light transition-colors">
              {m.name}
            </p>
            <p className="truncate text-[10px] text-muted-light">{m.instrument}</p>
            <p className="text-[10px] text-muted-dim">{m.location}</p>
          </Link>
        ))}
      </div>

      {/* View all */}
      <div className="mt-10 text-center">
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent-light transition-all hover:gap-3"
        >
          View all musicians
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}

const musicians = [
  {
    name: "Alex Rivera",
    age: 24,
    instrument: "Guitarist",
    genres: ["Indie Rock", "Blues", "Funk"],
    bio: "Looking for a drummer and bassist to start an indie project. Influences: John Mayer, Khruangbin.",
  },
  {
    name: "Maya Chen",
    age: 27,
    instrument: "Vocalist",
    genres: ["R&B", "Soul", "Jazz"],
    bio: "Singer-songwriter looking for a producer to collaborate on an EP. Think Erykah Badu meets Hiatus Kaiyote.",
  },
  {
    name: "James Okafor",
    age: 22,
    instrument: "Drummer",
    genres: ["Afrobeat", "Jazz", "Hip-Hop"],
    bio: "Session drummer looking for live bands. Love polyrhythms and fusion grooves. Let's create something fresh.",
  },
];

function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function MusicNoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export default function SwipePreview() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      {/* Section header */}
      <div className="mb-16 text-center">
        <span className="mb-4 inline-block label">
          Discover & Connect
        </span>
        <h2 className="heading text-3xl sm:text-4xl">
          Find Your Next Bandmate
        </h2>
        <p className="mt-4 text-foreground">
          Browse through musician profiles and connect with the ones that
          inspire you.
        </p>
      </div>

      {/* Card stack */}
      <div className="relative mx-auto flex h-105 w-full max-w-sm items-center justify-center">
        {musicians.map((m, i) => (
          <div
            key={m.name}
            className="card absolute w-full p-6 transition-all duration-300"
            style={{
              zIndex: musicians.length - i,
              transform: "rotate(" + ((i - 1) * 4) + "deg) translateY(" + ((i - 1) * -8) + "px) scale(" + (1 - i * 0.02) + ")",
              opacity: 1 - i * 0.15,
            }}
          >
            {/* Card gradient overlay — warm editorial gradient */}
            <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-background/90 via-background/40 to-transparent pointer-events-none" />

            {/* Card content */}
            <div className="relative z-10 flex h-full flex-col justify-between">
              {/* Top: avatar placeholder + instrument */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle">
                    <MusicNoteIcon />
                  </div>
                  <div>
                    <h3 className="heading text-lg text-foreground">
                      {m.name}, {m.age}
                    </h3>
                    <p className="text-sm text-muted">{m.instrument}</p>
                  </div>
                </div>
              </div>

              {/* Bottom: bio + tags */}
              <div>
                <p className="mb-3 text-sm leading-relaxed text-foreground">
                  {m.bio}
                </p>
                <div className="flex flex-wrap gap-2">
                  {m.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-accent-secondary/20 bg-accent-secondary-subtle px-3 py-1 text-xs font-medium text-accent-secondary-light"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border text-foreground transition-all hover:border-accent/30 hover:text-accent-light hover:bg-surface-hover hover:scale-110">
          <XIcon />
        </button>
        <button className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent/30 text-accent transition-all hover:border-accent hover:bg-accent-subtle hover:scale-110">
          <HeartIcon />
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Browse profiles &middot; Connect with musicians you vibe with
      </p>
    </section>
  );
}

const musicians = [
  {
    name: "Alex Rivera",
    age: 24,
    instrument: "Guitarist",
    genres: ["Indie Rock", "Blues", "Funk"],
    bio: "Looking for a drummer and bassist to start an indie project. Influences: John Mayer, Khruangbin.",
    color: "from-emerald-500/20 to-emerald-800/20",
  },
  {
    name: "Maya Chen",
    age: 27,
    instrument: "Vocalist",
    genres: ["R&B", "Soul", "Jazz"],
    bio: "Singer-songwriter looking for a producer to collaborate on an EP. Think Erykah Badu meets Hiatus Kaiyote.",
    color: "from-violet-500/20 to-violet-800/20",
  },
  {
    name: "James Okafor",
    age: 22,
    instrument: "Drummer",
    genres: ["Afrobeat", "Jazz", "Hip-Hop"],
    bio: "Session drummer looking for live bands. Love polyrhythms and fusion grooves. Let's create something fresh.",
    color: "from-amber-500/20 to-amber-800/20",
  },
];

export default function SwipePreview() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      {/* Section header */}
      <div className="mb-16 text-center">
        <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Swipe to Connect
        </span>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Discover Your Next Bandmate
        </h2>
        <p className="mt-4 text-muted">
          Swipe through musicians in your area. Match when the feeling is
          mutual.
        </p>
      </div>

      {/* Card stack */}
      <div className="relative mx-auto flex h-[420px] w-full max-w-sm items-center justify-center">
        {musicians.map((m, i) => (
          <div
            key={m.name}
            className={`card-stack absolute w-full rounded-2xl border border-border bg-gradient-to-b ${m.color} p-6 backdrop-blur-sm transition-all duration-300`}
            style={{
              zIndex: musicians.length - i,
              transform: `rotate(${(i - 1) * 4}deg) translateY(${(i - 1) * -8}px) scale(${1 - i * 0.02})`,
              opacity: 1 - i * 0.15,
            }}
          >
            {/* Card gradient overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Card content */}
            <div className="relative z-10 flex h-full flex-col justify-between">
              {/* Top: avatar placeholder + instrument */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg">
                    🎵
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {m.name}, {m.age}
                    </h3>
                    <p className="text-sm text-muted">{m.instrument}</p>
                  </div>
                </div>
              </div>

              {/* Bottom: bio + tags */}
              <div>
                <p className="mb-3 text-sm leading-relaxed text-gray-300">
                  {m.bio}
                </p>
                <div className="flex flex-wrap gap-2">
                  {m.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300"
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
        <button className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-500/30 text-red-400 transition-all hover:border-red-500 hover:bg-red-500/10 hover:scale-110">
          ✕
        </button>
        <button className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent/30 text-accent transition-all hover:border-accent hover:bg-accent/10 hover:scale-110">
          ♥
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Swipe right to connect · Swipe left to pass
      </p>
    </section>
  );
}

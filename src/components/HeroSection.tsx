export default function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-4 py-1.5 text-xs font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Connecting musicians worldwide
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
          Find Your Band.
          <br />
          <span className="gradient-text">Make Your Sound.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Connect with musicians who share your vibe. Whether you&apos;re a
          guitarist looking for a drummer or a vocalist forming a band — your
          next collaboration starts here.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-accent px-8 text-sm font-bold text-black transition-all hover:bg-accent-hover hover:scale-105 sm:w-auto"
          >
            Get Started Free
          </a>
          <a
            href="/discover"
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-border px-8 text-sm font-medium text-foreground transition-all hover:bg-surface sm:w-auto"
          >
            See How It Works
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-16 flex items-center gap-6 text-xs text-muted">
          <div className="flex -space-x-2">
            {["/api/placeholder/32/32", "/api/placeholder/32/32", "/api/placeholder/32/32"].map(
              (src, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-background bg-surface-elevated"
                />
              ),
            )}
          </div>
          <span>
            <strong className="text-foreground">12,000+</strong> musicians
            already connected
          </span>
        </div>
      </div>
    </section>
  );
}

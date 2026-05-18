export default function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎵</span>
              <span className="text-lg font-bold tracking-tight">
                MeloMatch
              </span>
            </a>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              The platform for musicians to find their next collaborator, band,
              or creative partner. No more awkward cold DMs.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
              Platform
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Discover", href: "/discover" },
                { label: "Messages", href: "#" },
                { label: "Events", href: "#" },
                { label: "Premium", href: "#" },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
              Company
            </h4>
            <ul className="space-y-3">
              {["About", "Blog", "Careers", "Contact"].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 text-xs text-muted sm:flex-row">
          <p>&copy; 2026 MeloMatch. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

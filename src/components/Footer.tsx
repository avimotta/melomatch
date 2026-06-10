import Link from "next/link";

function MusicNoteIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent-light)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <MusicNoteIcon />
              <span className="heading text-lg tracking-tight text-foreground">
                MeloMatch
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              The platform for musicians to find their next collaborator, band,
              or creative partner. No more awkward cold DMs.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 label">
              Platform
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Discover", href: "/discover" },
                { label: "Messages", href: "#" },
                { label: "Premium", href: "#" },
              ].map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("/") ? (
                    <Link
                      href={l.href}
                      className="text-sm text-foreground transition-colors hover:text-accent-light"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      className="text-sm text-foreground transition-colors hover:text-accent-light"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 label">
              Company
            </h4>
            <ul className="space-y-3">
              {["About", "Blog", "Careers", "Contact"].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-foreground transition-colors hover:text-accent-light"
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

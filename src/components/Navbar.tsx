"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            MeloMatch
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink href="/discover">Discover</NavLink>
          <NavLink href="#">Messages</NavLink>
          <NavLink href="#">Events</NavLink>

          <div className="flex items-center gap-3 pl-4">
            {loading ? (
              <div className="h-5 w-5 animate-pulse rounded-full bg-border" />
            ) : user ? (
              /* Logged in — avatar dropdown */
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-black transition-all hover:scale-105"
                >
                  {initial}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-xl shadow-black/30">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-medium text-foreground">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Logged out */
              <>
                <a
                  href="/login"
                  className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  Log In
                </a>
                <a
                  href="/login"
                  className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black transition-all hover:bg-accent-hover hover:scale-105"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex flex-col gap-1 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 rounded-full bg-foreground transition-all ${
              isMobileOpen ? "translate-y-1.5 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-foreground transition-all ${
              isMobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-foreground transition-all ${
              isMobileOpen ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="border-t border-border/50 bg-surface px-6 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a
              href="/discover"
              className="text-sm font-medium text-muted"
              onClick={() => setIsMobileOpen(false)}
            >
              Discover
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted"
              onClick={() => setIsMobileOpen(false)}
            >
              Messages
            </a>
            <a
              href="#"
              className="text-sm font-medium text-muted"
              onClick={() => setIsMobileOpen(false)}
            >
              Events
            </a>
            <hr className="border-border/50" />

            {user ? (
              <>
                <div className="text-sm text-muted/70">{user.email}</div>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileOpen(false);
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="text-sm font-medium text-muted"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Log In
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-muted transition-colors hover:text-foreground"
    >
      {children}
    </a>
  );
}

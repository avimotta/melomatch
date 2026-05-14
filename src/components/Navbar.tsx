"use client";

import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
          <a
            href="/discover"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Discover
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Messages
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Events
          </a>
          <div className="flex items-center gap-3 pl-4">
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
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col gap-1 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 rounded-full bg-foreground transition-all ${
              isOpen ? "translate-y-1.5 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-foreground transition-all ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-foreground transition-all ${
              isOpen ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-border/50 bg-surface px-6 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="/discover" className="text-sm font-medium text-muted">
              Discover
            </a>
            <a href="#" className="text-sm font-medium text-muted">
              Messages
            </a>
            <a href="#" className="text-sm font-medium text-muted">
              Events
            </a>
            <hr className="border-border/50" />
            <a href="/login" className="text-sm font-medium text-muted">
              Log In
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black"
            >
              Sign Up
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

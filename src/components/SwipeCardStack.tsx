"use client";

import { useState, useCallback } from "react";
import Avatar from "@/components/Avatar";

type Profile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  instruments: string[] | null;
  genres: string[] | null;
  bio: string | null;
  location: string | null;
};

type SwipeCardStackProps = {
  profiles: Profile[];
  sentIds: Set<string>;
  connectingId: string | null;
  onConnect: (profileId: string) => void;
  onViewProfile: (profileId: string) => void;
};

// ── Icons ────────────────────────────────────────────────────────

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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

// ── Styles (keyframe injected once) ──────────────────────────────

const keyframesId = "swipe-card-enter";
const styleId = "__swipe_card_style";

function injectKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @keyframes ${keyframesId} {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ── Component ────────────────────────────────────────────────────

export default function SwipeCardStack({
  profiles,
  sentIds,
  connectingId,
  onConnect,
  onViewProfile,
}: SwipeCardStackProps) {
  // Start at the first profile not already sent a connection
  const [currentIndex, setCurrentIndex] = useState(() => {
    let idx = 0;
    while (idx < profiles.length && sentIds.has(profiles[idx].id)) {
      idx++;
    }
    return idx;
  });
  const [animKey, setAnimKey] = useState(0);

  // Inject keyframes once (idempotent)
  if (typeof window !== "undefined") injectKeyframes();

  const currentProfile = profiles[currentIndex] ?? null;
  const isDone = currentIndex >= profiles.length || profiles.length === 0;
  const isLocked = connectingId !== null;

  // Advance skipping over profiles already sent a connection
  const advance = useCallback(() => {
    setCurrentIndex((prev) => {
      let next = prev + 1;
      while (next < profiles.length && sentIds.has(profiles[next].id)) {
        next++;
      }
      return Math.min(next, profiles.length);
    });
    setAnimKey((k) => k + 1);
  }, [profiles, sentIds]);

  const handleLike = useCallback(() => {
    if (!currentProfile || isLocked) return;
    onConnect(currentProfile.id);
    advance();
  }, [currentProfile, isLocked, onConnect, advance]);

  const handleSkip = useCallback(() => {
    if (isLocked) return;
    advance();
  }, [isLocked, advance]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setAnimKey((k) => k + 1);
  }, []);

  // ── Empty state (all profiles swiped) ──

  if (isDone) {
    return (
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="border-t border-border pt-16">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle">
            <MusicNoteIcon />
          </div>
          <p className="heading text-2xl text-foreground mt-4">That's all for now</p>
          <p className="text-sm text-muted mt-2">
            {profiles.length > 0
              ? "You've browsed every musician in this set."
              : "No musicians to show right now."}
          </p>
          {profiles.length > 0 && (
            <button
              onClick={handleReset}
              className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-accent/50 px-5 py-1.5 text-xs text-accent-light transition-all hover:bg-accent hover:text-background"
            >
              Start over
            </button>
          )}
        </div>
      </section>
    );
  }

  const p = currentProfile!;

  // ── Profile card ──

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="border-t border-border pt-8">
        <span className="label">Swipe</span>
      </div>

      <div className="flex justify-center">
        {/* Card */}
        <div
          key={`card-${p.id}-${animKey}`}
          className="card-enter mt-6 w-full max-w-md rounded-2xl border border-border bg-surface-elevated p-6 shadow-lg"
          style={{ animation: `${keyframesId} 0.3s ease-out` }}
        >
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="h-32 w-32 overflow-hidden rounded-full bg-linear-to-br from-accent-secondary/20 via-accent/5 to-surface-elevated">
              <Avatar
                avatarUrl={p.avatar_url}
                id={p.id}
                alt={p.name ?? ""}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Name & instruments */}
          <div className="mt-6 text-center">
            <h2 className="heading text-2xl text-foreground">
              {p.name ?? "Unknown"}
            </h2>
            {p.instruments && p.instruments.length > 0 && (
              <p className="mt-1 text-sm text-muted">
                {p.instruments.join(", ")}
              </p>
            )}
          </div>

          {/* Genres */}
          {p.genres && p.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {p.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-accent-secondary/20 bg-accent-secondary-subtle px-3 py-1 text-xs font-medium text-accent-secondary-light"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {p.bio && (
            <p className="mt-4 text-center text-sm leading-relaxed text-foreground">
              {p.bio}
            </p>
          )}

          {/* View profile */}
          <div className="mt-4 text-center">
            <button
              onClick={() => onViewProfile(p.id)}
              className="text-xs text-foreground underline underline-offset-2 transition-colors hover:text-accent-light"
            >
              View profile
            </button>
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={handleSkip}
          disabled={isLocked}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border text-foreground transition-all hover:border-accent/30 hover:text-accent-light hover:bg-surface-hover hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Skip"
        >
          <XIcon />
        </button>

        <button
          onClick={handleLike}
          disabled={isLocked}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent/30 text-accent transition-all hover:border-accent hover:bg-accent-subtle hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Like"
        >
          <HeartIcon />
        </button>
      </div>

      {/* Counter */}
      {profiles.length > 1 && (
        <p className="mt-6 text-center text-[11px] text-muted">
          {currentIndex + 1} of {profiles.length}
        </p>
      )}
    </section>
  );
}

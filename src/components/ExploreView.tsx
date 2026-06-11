"use client";

import { useMemo } from "react";
import Avatar from "@/components/Avatar";

type Profile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  instruments: string[] | null;
  genres: string[] | null;
  experience_level: string | null;
  looking_for: string[] | null;
  location: string | null;
  bio: string | null;
};

type ExploreViewProps = {
  profiles: Profile[];
  sentIds: Set<string>;
  receivedIds: Set<string>;
  connectingId: string | null;
  onConnect: (profileId: string) => void;
  onViewProfile: (profileId: string) => void;
};

function HeartSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function ExploreView({
  profiles,
  sentIds,
  receivedIds,
  connectingId,
  onConnect,
  onViewProfile,
}: ExploreViewProps) {
  // ── Derived state ──────────────────────────────────────────────

  const featuredProfile = useMemo(() => {
    if (profiles.length === 0) return null;
    const scored = profiles.map((p) => ({
      profile: p,
      score:
        (p.name ? 2 : 0) +
        (p.bio ? 2 : 0) +
        (p.instruments?.length ? 1 : 0) +
        (p.genres?.length ? 1 : 0) +
        (p.location ? 1 : 0),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0].profile;
  }, [profiles]);

  const compactProfiles = useMemo(() => {
    return profiles.filter((p) => p.id !== featuredProfile?.id);
  }, [profiles, featuredProfile]);

  const leftProfiles = useMemo(
    () => compactProfiles.filter((_, i) => i % 2 === 0),
    [compactProfiles],
  );
  const rightProfiles = useMemo(
    () => compactProfiles.filter((_, i) => i % 2 === 1),
    [compactProfiles],
  );

  // ── Render ─────────────────────────────────────────────────────

  return (
    <>
      {/* Featured profile */}
      {featuredProfile && (
        <div className="border-t border-border pt-8">
          <span className="label">Featured</span>

          {(() => {
            const p = featuredProfile;
            const sent = sentIds.has(p.id);
            const received = receivedIds.has(p.id);
            const isMatched = sent && received;
            const isPending = sent && !received;
            const isConnecting = connectingId === p.id;

            return (
              <div className="mt-4 grid gap-6 lg:grid-cols-5">
                {/* Text */}
                <div className="lg:col-span-3">
                  <h2 className="heading text-2xl sm:text-3xl lg:text-4xl text-foreground">
                    <button
                      onClick={() => onViewProfile(p.id)}
                      className="hover:underline decoration-accent/30 underline-offset-4 text-left"
                    >
                      {p.name ?? "Unknown"}
                    </button>
                  </h2>

                  {p.instruments && p.instruments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.instruments.map((i) => (
                        <span key={i} className="text-xs text-muted-light">
                          {i}
                        </span>
                      ))}
                    </div>
                  )}

                  {p.bio && (
                    <p className="mt-3 max-w-prose text-sm leading-relaxed text-foreground">
                      {p.bio}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    {isMatched ? (
                      <span className="text-xs text-accent-light">Connected</span>
                    ) : isPending ? (
                      <span className="text-xs text-muted-light">Pending</span>
                    ) : (
                      <button
                        onClick={(e) => { e.preventDefault(); onConnect(p.id); }}
                        disabled={isConnecting}
                        className="inline-flex items-center gap-1.5 rounded-full border border-accent/50 px-5 py-1.5 text-xs text-accent-light transition-all hover:bg-accent hover:text-background"
                      >
                        <HeartSvg />
                        {isConnecting ? "Connecting..." : "Connect"}
                      </button>
                    )}
                    <button
                      onClick={() => onViewProfile(p.id)}
                      className="text-xs text-foreground underline underline-offset-2 transition-colors hover:text-accent-light"
                    >
                      View profile
                    </button>
                  </div>
                </div>

                {/* Visual — avatar / album-art area */}
                <div className="hidden lg:col-span-1 lg:block">
                  <div className="aspect-square overflow-hidden rounded-xl bg-linear-to-br from-accent-secondary/20 via-accent/5 to-surface-elevated">
                    <Avatar
                      avatarUrl={p.avatar_url}
                      id={p.id}
                      alt={p.name ?? ""}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* More musicians */}
      {compactProfiles.length > 0 && (
        <div className="mt-16">
          <div className="border-t border-border pt-8">
            <span className="label">More musicians</span>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Left column */}
            <div className="flex flex-col">
              {leftProfiles.map((p) => {
                const sent = sentIds.has(p.id);
                const received = receivedIds.has(p.id);
                const isMatched = sent && received;
                const isPending = sent && !received;
                const isConnecting = connectingId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onViewProfile(p.id)}
                    className="group flex w-full items-center gap-4 border-b border-border/50 py-4 text-left transition-colors hover:border-accent/30"
                  >
                    <Avatar
                      avatarUrl={p.avatar_url}
                      id={p.id}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full bg-accent-secondary/10 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="heading text-base text-foreground group-hover:text-accent-secondary transition-colors">
                        {p.name ?? "Unknown"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {p.instruments?.join(", ")}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isMatched ? (
                        <span className="text-[11px] text-accent-light">Connected</span>
                      ) : isPending ? (
                        <span className="text-[11px] text-muted-light">Pending</span>
                      ) : (
                        <span
                          onClick={(e) => { e.stopPropagation(); onConnect(p.id); }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onConnect(p.id); } }}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] text-foreground transition-colors hover:border-accent/50"
                        >
                          <HeartSvg />
                          {isConnecting ? "..." : "Connect"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right column */}
            <div className="flex flex-col">
              {rightProfiles.map((p) => {
                const sent = sentIds.has(p.id);
                const received = receivedIds.has(p.id);
                const isMatched = sent && received;
                const isPending = sent && !received;
                const isConnecting = connectingId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onViewProfile(p.id)}
                    className="group flex w-full items-center gap-4 border-b border-border/50 py-4 text-left transition-colors hover:border-accent/30"
                  >
                    <Avatar
                      avatarUrl={p.avatar_url}
                      id={p.id}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-full bg-accent-secondary/10 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="heading text-base text-foreground group-hover:text-accent-secondary transition-colors">
                        {p.name ?? "Unknown"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {p.instruments?.join(", ")}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isMatched ? (
                        <span className="text-[11px] text-accent-light">Connected</span>
                      ) : isPending ? (
                        <span className="text-[11px] text-muted-light">Pending</span>
                      ) : (
                        <span
                          onClick={(e) => { e.stopPropagation(); onConnect(p.id); }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onConnect(p.id); } }}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] text-foreground transition-colors hover:border-accent/50"
                        >
                          <HeartSvg />
                          {isConnecting ? "..." : "Connect"}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

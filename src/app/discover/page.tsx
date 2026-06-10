"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/Avatar";
import type { Connection } from "@/lib/database.types";

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

function MusicNoteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export default function DiscoverPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Profiles
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  // Connections
  const [connections, setConnections] = useState<Connection[]>([]);

  // Connect interaction
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Filter state
  const [filterInstrument, setFilterInstrument] = useState("");
  const [filterGenre, setFilterGenre] = useState("");

  // ── Derived state ──────────────────────────────────────────────

  // Derive from user — not loading when logged out (avoid sync setState in effect)
  const isProfilesLoading = user ? profilesLoading : false;

  const sentIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(
      connections
        .filter((c) => c.sender_id === user.id)
        .map((c) => c.receiver_id),
    );
  }, [connections, user]);

  const receivedIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(
      connections
        .filter((c) => c.receiver_id === user.id)
        .map((c) => c.sender_id),
    );
  }, [connections, user]);

  const displayedProfiles = useMemo(
    () => profiles.filter((p) => p.id !== user?.id),
    [profiles, user],
  );

  // Unique filter values from profiles
  const uniqueInstruments = useMemo(() => {
    const set = new Set<string>();
    for (const p of displayedProfiles) {
      for (const inst of p.instruments ?? []) {
        set.add(inst);
      }
    }
    return Array.from(set).sort();
  }, [displayedProfiles]);

  const uniqueGenres = useMemo(() => {
    const set = new Set<string>();
    for (const p of displayedProfiles) {
      for (const g of p.genres ?? []) {
        set.add(g);
      }
    }
    return Array.from(set).sort();
  }, [displayedProfiles]);

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return displayedProfiles.filter((p) => {
      if (
        filterInstrument &&
        !(p.instruments ?? []).some(
          (i) => i.toLowerCase() === filterInstrument.toLowerCase(),
        )
      ) {
        return false;
      }
      if (
        filterGenre &&
        !(p.genres ?? []).some(
          (g) => g.toLowerCase() === filterGenre.toLowerCase(),
        )
      ) {
        return false;
      }
      return true;
    });
  }, [displayedProfiles, filterInstrument, filterGenre]);

  const hasActiveFilters = filterInstrument !== "" || filterGenre !== "";

  // ── Auth guard ─────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // ── Fetch profiles ─────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchProfiles = async () => {
      setProfilesLoading(true);
      setProfilesError(null);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, instruments, genres, experience_level, looking_for, location, bio")
        .order("name", { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setProfilesError(fetchError.message);
        setProfilesLoading(false);
        return;
      }

      setProfiles(data ?? []);
      setProfilesLoading(false);
    };

    fetchProfiles();
    return () => { cancelled = true; };
  }, [user]);

  // ── Fetch connections ──────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchConnections = async () => {
      const { data } = await supabase
        .from("connections")
        .select("id, sender_id, receiver_id, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (cancelled) return;

      setConnections(data ?? []);
    };

    fetchConnections();
    return () => { cancelled = true; };
  }, [user]);

  // ── Connect handler ────────────────────────────────────────────

  const handleConnect = async (receiverId: string) => {
    if (!user || connectingId) return;

    setConnectingId(receiverId);
    setConnectError(null);

    const { error: insertError } = await supabase.from("connections").insert({
      sender_id: user.id,
      receiver_id: receiverId,
    });

    setConnectingId(null);

    if (insertError) {
      if (insertError.code === "23505") {
        setConnections((prev) => [
          ...prev,
          {
            id: "",
            sender_id: user.id,
            receiver_id: receiverId,
            created_at: new Date().toISOString(),
          },
        ]);
        return;
      }
      setConnectError(insertError.message);
      setTimeout(() => setConnectError(null), 4000);
      return;
    }

    setConnections((prev) => [
      ...prev,
      {
        id: "",
        sender_id: user.id,
        receiver_id: receiverId,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  // ── Determine featured profile ─────────────────────────────────

  const featuredProfile = useMemo(() => {
    if (filteredProfiles.length === 0) return null;
    const scored = filteredProfiles.map((p) => ({
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
  }, [filteredProfiles]);

  const compactProfiles = useMemo(() => {
    return filteredProfiles.filter((p) => p.id !== featuredProfile?.id);
  }, [filteredProfiles, featuredProfile]);

  // Split compact profiles into left/right columns
  const leftProfiles = useMemo(
    () => compactProfiles.filter((_, i) => i % 2 === 0),
    [compactProfiles],
  );
  const rightProfiles = useMemo(
    () => compactProfiles.filter((_, i) => i % 2 === 1),
    [compactProfiles],
  );

  // ── Render ─────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-light border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen page-gradient">
      <div className="accent-glow pointer-events-none absolute -top-40 right-0 h-150 w-150 opacity-30" />

      {/* ── Editorial Hero Section ──────────────────────────────── */}
      <section className="relative overflow-hidden pt-20">
        {/* Atmosphere gradient */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-accent/5 via-transparent to-background" />

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-8">

          {/* Header */}
          <div className="mb-12">
            <h1 className="heading-display text-foreground">Discover</h1>
          </div>

          {/* Filter chips — inline, no card */}
          {!isProfilesLoading && !profilesError && displayedProfiles.length > 0 && (
            <div className="mb-14 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterInstrument("")}
                className={
                  "rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider transition-colors " +
                  (!filterInstrument
                    ? "border-accent bg-accent/10 text-accent-light"
                    : "border-border text-foreground hover:border-accent/50")
                }
              >
                All
              </button>
              {uniqueInstruments.slice(0, 6).map((inst) => (
                <button
                  key={inst}
                  onClick={() =>
                    setFilterInstrument(filterInstrument === inst ? "" : inst)
                  }
                  className={
                    "rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider transition-colors " +
                    (filterInstrument === inst
                      ? "border-accent bg-accent/10 text-accent-light"
                      : "border-border text-foreground hover:border-accent/50")
                  }
                >
                  {inst}
                </button>
              ))}
              <span className="mx-1 text-[10px] text-muted-light">|</span>
              {uniqueGenres.slice(0, 4).map((g) => (
                <button
                  key={g}
                  onClick={() =>
                    setFilterGenre(filterGenre === g ? "" : g)
                  }
                  className={
                    "rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider transition-colors " +
                    (filterGenre === g
                      ? "border-accent bg-accent/10 text-accent-light"
                      : "border-border text-foreground hover:border-accent/50")
                  }
                >
                  {g}
                </button>
              ))}
              {hasActiveFilters && (
                <button
                  onClick={() => { setFilterInstrument(""); setFilterGenre(""); }}
                  className="text-[11px] text-foreground underline underline-offset-2 transition-colors hover:text-accent-light"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Connect error */}
          {connectError && (
            <p className="mb-6 text-xs text-danger">{connectError}</p>
          )}

          {/* Featured profile */}
          {!isProfilesLoading && !profilesError && featuredProfile && (
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
                        <Link href={"/profile/" + p.id} className="hover:underline decoration-accent/30 underline-offset-4">
                          {p.name ?? "Unknown"}
                        </Link>
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
                            onClick={(e) => { e.preventDefault(); handleConnect(p.id); }}
                            disabled={isConnecting}
                            className="rounded-full border border-accent/50 px-5 py-1.5 text-xs text-accent-light transition-all hover:bg-accent hover:text-background"
                          >
                            {isConnecting ? "Connecting..." : "Connect"}
                          </button>
                        )}
                        <Link
                          href={"/profile/" + p.id}
                          className="text-xs text-foreground underline underline-offset-2 transition-colors hover:text-accent-light"
                        >
                          View profile
                        </Link>
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
        </div>
      </section>

      {/* ── More Musicians ─────────────────────────────────────────── */}
      {!isProfilesLoading && !profilesError && compactProfiles.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-24">
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
                  <Link
                    key={p.id}
                    href={"/profile/" + p.id}
                    className="group flex items-center gap-4 border-b border-border/50 py-4 transition-colors hover:border-accent/30"
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
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleConnect(p.id); }}
                          disabled={isConnecting}
                          className="rounded-full border border-border px-3 py-1 text-[11px] text-foreground transition-colors hover:border-accent/50"
                        >
                          {isConnecting ? "..." : "Connect"}
                        </button>
                      )}
                    </div>
                  </Link>
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
                  <Link
                    key={p.id}
                    href={"/profile/" + p.id}
                    className="group flex items-center gap-4 border-b border-border/50 py-4 transition-colors hover:border-accent/30"
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
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleConnect(p.id); }}
                          disabled={isConnecting}
                          className="rounded-full border border-border px-3 py-1 text-[11px] text-foreground transition-colors hover:border-accent/50"
                        >
                          {isConnecting ? "..." : "Connect"}
                        </button>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Loading ──────────────────────────────────────── */}
      {isProfilesLoading && (
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-light border-t-transparent" />
          <p className="text-xs text-muted">Loading musicians...</p>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────── */}
      {profilesError && (
        <div className="mx-auto max-w-6xl px-6 pb-24">
          <div className="border-t border-border pt-8">
            <p className="text-xs text-danger">Failed to load profiles</p>
            <p className="mt-1 text-[11px] text-danger/70">{profilesError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-[11px] text-foreground underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Empty — no profiles at all ───────────────────── */}
      {!isProfilesLoading && !profilesError && !hasActiveFilters && displayedProfiles.length === 0 && (
        <div className="mx-auto max-w-6xl px-6 pb-24">
          <div className="border-t border-border pt-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle">
              <MusicNoteIcon />
            </div>
            <p className="mt-4 heading text-2xl text-foreground">No musicians yet</p>
            <p className="mt-2 text-sm text-muted">Be the first to create your profile!</p>
          </div>
        </div>
      )}

      {/* ── Empty — filtered no matches ──────────────────── */}
      {!isProfilesLoading && !profilesError && displayedProfiles.length > 0 && hasActiveFilters && filteredProfiles.length === 0 && (
        <div className="mx-auto max-w-6xl px-6 pb-24">
          <div className="border-t border-border pt-16">
            <p className="heading text-xl text-foreground">No matches</p>
            <p className="mt-1 text-sm text-muted">Try different filters</p>
            <button
              onClick={() => { setFilterInstrument(""); setFilterGenre(""); }}
              className="mt-3 text-xs text-accent-light underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

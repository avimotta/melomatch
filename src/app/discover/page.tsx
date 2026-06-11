"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import ExploreView from "@/components/ExploreView";
import SwipeCardStack from "@/components/SwipeCardStack";
import FilterDropdown from "@/components/FilterDropdown";
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

  // View mode
  const [viewMode, setViewMode] = useState<"explore" | "swipe">("swipe");

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

  // Connected profiles (any direction) — excluded from swipe
  const connectedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const id of sentIds) ids.add(id);
    for (const id of receivedIds) ids.add(id);
    return ids;
  }, [sentIds, receivedIds]);

  // Swipe-only profiles — exclude connected, randomize order
  const swipeProfiles = useMemo(
    () => filteredProfiles.filter((p) => !connectedIds.has(p.id)),
    [filteredProfiles, connectedIds],
  );

  const randomizedSwipeProfiles = useMemo(() => {
    const shuffled = [...swipeProfiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [swipeProfiles]);

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
          <div className="mb-8">
            <h1 className="heading-display text-foreground">Discover</h1>
          </div>

          {/* ── View toggle ────────────────────────────────────── */}
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => setViewMode("swipe")}
              className={
                "text-xs uppercase tracking-wider transition-colors " +
                (viewMode === "swipe"
                  ? "text-accent-light"
                  : "text-muted hover:text-foreground")
              }
            >
              Swipe
            </button>
            <span className="text-[10px] text-muted-light">|</span>
            <button
              onClick={() => setViewMode("explore")}
              className={
                "text-xs uppercase tracking-wider transition-colors " +
                (viewMode === "explore"
                  ? "text-accent-light"
                  : "text-muted hover:text-foreground")
              }
            >
              Explore
            </button>
          </div>

          {/* ── Filters — only in Explore ─────────────────────── */}
          {viewMode === "explore" && !isProfilesLoading && !profilesError && displayedProfiles.length > 0 && (
            <div className="mb-14">
              {/* Dropdown triggers */}
              <div className="flex flex-wrap items-center gap-2">
                <FilterDropdown
                  label="Instruments"
                  options={uniqueInstruments}
                  selected={filterInstrument}
                  onSelect={(value) =>
                    setFilterInstrument(filterInstrument === value ? "" : value)
                  }
                />
                <FilterDropdown
                  label="Genres"
                  options={uniqueGenres}
                  selected={filterGenre}
                  onSelect={(value) =>
                    setFilterGenre(filterGenre === value ? "" : value)
                  }
                />
              </div>

              {/* Active filter chips (removable) */}
              {(filterInstrument || filterGenre) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {filterInstrument && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-wider text-accent-light">
                      {filterInstrument}
                      <button
                        onClick={() => setFilterInstrument("")}
                        className="text-accent-light/60 hover:text-accent-light transition-colors"
                        aria-label={`Remove ${filterInstrument} filter`}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M2 2l6 6M8 2l-6 6" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {filterGenre && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-wider text-accent-light">
                      {filterGenre}
                      <button
                        onClick={() => setFilterGenre("")}
                        className="text-accent-light/60 hover:text-accent-light transition-colors"
                        aria-label={`Remove ${filterGenre} filter`}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M2 2l6 6M8 2l-6 6" />
                        </svg>
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => { setFilterInstrument(""); setFilterGenre(""); }}
                    className="text-[11px] text-foreground underline underline-offset-2 transition-colors hover:text-accent-light"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Connect error */}
          {connectError && (
            <p className="mb-6 text-xs text-danger">{connectError}</p>
          )}

          {/* ── View content ───────────────────────────────── */}
          {!isProfilesLoading && !profilesError && filteredProfiles.length > 0 && (
            viewMode === "explore" ? (
              <ExploreView
                profiles={filteredProfiles}
                sentIds={sentIds}
                receivedIds={receivedIds}
                connectingId={connectingId}
                onConnect={handleConnect}
                onViewProfile={(id) => router.push(`/profile/${id}`)}
              />
            ) : (
              <SwipeCardStack
                key={`swipe-${filterInstrument}-${filterGenre}`}
                profiles={randomizedSwipeProfiles}
                sentIds={sentIds}
                connectingId={connectingId}
                onConnect={handleConnect}
                onViewProfile={(id) => router.push(`/profile/${id}`)}
              />
            )
          )}
        </div>
      </section>

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

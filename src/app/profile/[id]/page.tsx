"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/Avatar";
import type { Profile } from "@/lib/database.types";

export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const profileId = params.id as string;

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Connection state
  const [sentConnection, setSentConnection] = useState(false);
  const [receivedConnection, setReceivedConnection] = useState(false);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Derived
  const isOwnProfile = user !== null && user.id === profileId;

  // Derive from user — not loading when logged out or on own profile
  const isProfileLoading = user ? profileLoading : false;
  const isConnectionsLoading = user && !isOwnProfile ? connectionsLoading : false;

  // ── Auth guard ─────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // ── Fetch profile ─────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, instruments, genres, location, bio, influences, looking_for, experience_level, email")
        .eq("id", profileId)
        .single();

      if (cancelled) return;

      if (fetchError) {
        setProfileError(fetchError.message);
        setProfileLoading(false);
        return;
      }

      setProfile(data);
      setProfileLoading(false);
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [user, profileId]);

  // ── Fetch connection status ────────────────────────────────────

  useEffect(() => {
    if (!user || isOwnProfile) return;

    let cancelled = false;

    const fetchConnection = async () => {
      setConnectionsLoading(true);

      const { data } = await supabase
        .from("connections")
        .select("id, sender_id, receiver_id")
        .or(
          "and(sender_id.eq." +
            user.id +
            ",receiver_id.eq." +
            profileId +
            "),and(sender_id.eq." +
            profileId +
            ",receiver_id.eq." +
            user.id +
            ")",
        );

      if (cancelled) return;

      const sent = (data ?? []).some(
        (c) => c.sender_id === user.id && c.receiver_id === profileId,
      );
      const received = (data ?? []).some(
        (c) => c.sender_id === profileId && c.receiver_id === user.id,
      );

      setSentConnection(sent);
      setReceivedConnection(received);
      setConnectionsLoading(false);
    };

    fetchConnection();
    return () => { cancelled = true; };
  }, [user, profileId, isOwnProfile]);

  // ── Connect handler ───────────────────────────────────────────

  const handleConnect = async () => {
    if (!user || connecting || !profile) return;

    setConnecting(true);
    setConnectError(null);

    const { error: insertError } = await supabase.from("connections").insert({
      sender_id: user.id,
      receiver_id: profileId,
    });

    setConnecting(false);

    if (insertError) {
      if (insertError.code === "23505") {
        setSentConnection(true);
        return;
      }
      setConnectError(insertError.message);
      setTimeout(() => setConnectError(null), 4000);
      return;
    }

    setSentConnection(true);
  };

  const isMatched = sentConnection && receivedConnection;
  const isPending = sentConnection && !receivedConnection;

  // ── Render ────────────────────────────────────────────────────

  if (authLoading || isProfileLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </main>
    );
  }

  if (profileError) {
    return (
      <main className="min-h-screen bg-background">
        <div className="border-t border-border">
          <div className="mx-auto max-w-3xl px-6 pb-24 pt-16 lg:pb-32 lg:pt-20">
            <p className="text-sm text-danger">Failed to load profile</p>
            <p className="mt-1 text-xs text-danger/70">{profileError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs text-foreground underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-background">
        <div className="border-t border-border">
          <div className="mx-auto max-w-3xl px-6 pb-24 pt-16 lg:pb-32 lg:pt-20">
            <p className="heading text-xl text-foreground">Profile not found</p>
            <p className="mt-1 text-sm text-muted">
              This musician doesn&apos;t exist or their profile has been removed.
            </p>
            <Link
              href="/discover"
              className="mt-4 inline-block text-xs text-accent-light underline underline-offset-2"
            >
              Back to Discover &rarr;
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Profile content ───────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background">
      {/* ── Editorial Hero — full-width, no card ────────────────── */}
      <section className="relative overflow-hidden pt-20">
        {/* Atmospheric gradient background */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-accent/8 via-accent/3 to-background" />

        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-8">
          {/* Back link */}
          <Link
            href="/discover"
            className="inline-flex items-center gap-1 text-xs text-foreground transition-colors hover:text-accent"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8L10 4" />
            </svg>
            Discover
          </Link>

          {/* Main hero content — text left, visual right, centered */}
          <div className="mx-auto max-w-5xl">
            <div className="mt-6 grid gap-10 lg:grid-cols-5">
              {/* Text column */}
              <div className="lg:col-span-3">
                <h1 className="heading-display text-foreground">
                  {profile.name ?? "Unknown Musician"}
                </h1>

                {profile.location && (
                  <p className="mt-2 text-sm text-muted">
                    Based in {profile.location}
                  </p>
                )}

                {profile.looking_for && profile.looking_for.length > 0 && (
                  <p className="mt-4 text-sm text-muted">
                    Looking for{" "}
                    {profile.looking_for.map((item, i) => (
                      <span key={item}>
                        <span className="text-accent-light">{item}</span>
                        {i < profile.looking_for!.length - 1 && <span className="text-muted-light">, </span>}
                      </span>
                    ))}
                  </p>
                )}

                {profile.instruments && profile.instruments.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {profile.instruments.map((inst) => (
                      <span key={inst} className="text-xs text-muted-light">
                        {inst}
                      </span>
                    ))}
                  </div>
                )}

                {profile.genres && profile.genres.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {profile.genres.map((g) => (
                      <span key={g} className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-accent-light">
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {profile.bio && (
                  <p className="mt-6 max-w-prose text-base leading-relaxed text-foreground">
                    {profile.bio}
                  </p>
                )}

                {profile.influences && (
                  <p className="mt-3 text-sm text-muted">
                    Influenced by {profile.influences}
                  </p>
                )}

                {profile.experience_level && (
                  <p className="mt-3 text-xs text-muted-light">
                    {profile.experience_level}
                  </p>
                )}

                <div className="mt-6">
                  {isOwnProfile ? (
                    <Link href="/profile" className="inline-block rounded-full border border-accent/50 px-6 py-2 text-xs text-accent-light transition-all hover:bg-accent hover:text-background">
                      Edit Profile
                    </Link>
                  ) : isConnectionsLoading ? (
                    <span className="text-xs text-muted-light">Loading...</span>
                  ) : connecting ? (
                    <span className="inline-flex items-center gap-2 text-xs text-muted">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                      Connecting
                    </span>
                  ) : isMatched ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-accent-light">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      Connected
                    </span>
                  ) : isPending ? (
                    <span className="text-xs text-muted-light">Pending</span>
                  ) : (
                    <button onClick={handleConnect} className="rounded-full border border-accent/50 px-6 py-2 text-xs text-accent-light transition-all hover:bg-accent hover:text-background">
                      Connect
                    </button>
                  )}
                </div>
              </div>

              {/* Visual column — avatar */}
              <div className="hidden lg:col-span-2 lg:block">
                <div className="aspect-square overflow-hidden rounded-xl bg-linear-to-br from-accent-secondary/20 via-accent/5 to-surface-elevated">
                  <Avatar
                    avatarUrl={profile.avatar_url}
                    id={profile.id}
                    alt={profile.name ?? ""}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connect error banner */}
      {connectError && (
        <div className="mx-auto max-w-6xl px-6 pb-8">
          <p className="text-xs text-danger">{connectError}</p>
        </div>
      )}
    </main>
  );
}

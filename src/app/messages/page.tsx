"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/Avatar";
import type { Profile } from "@/lib/database.types";

// ── SVG Icons ──────────────────────────────────────────────────────────

function WaveIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="0" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ── Types ──────────────────────────────────────────────────────────────

type ConnectedProfile = {
  connectionId: string;
  connectionCreatedAt: string;
  unreadCount: number;
  profile: Pick<
    Profile,
    "id" | "name" | "avatar_url" | "instruments" | "genres" | "location"
  >;
};

// ── Helpers ─────────────────────────────────────────────────────────────

function formatConnectedDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Connected today";
  if (diffDays === 1) return "Connected yesterday";
  if (diffDays < 30) return `Connected ${diffDays} days ago`;

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }
  return `Connected on ${date.toLocaleDateString("en-US", options)}`;
}

// ── Page ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [connectedProfiles, setConnectedProfiles] = useState<ConnectedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive from user — not loading when logged out
  const isLoading = user ? loading : false;

  // ── Auth guard ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // ── Fetch connected profiles ────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // 1. Fetch all connections involving the current user
      const { data: connections, error: connError } = await supabase
        .from("connections")
        .select("id, sender_id, receiver_id, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (cancelled) {
        return;
      }

      if (connError) {
        setError(connError.message);
        setLoading(false);
        return;
      }

      if (!connections || connections.length === 0) {
        setConnectedProfiles([]);
        setLoading(false);
        return;
      }

      // 2. Separate into sent (user initated) and received (partner initated)
      const sentPartners = new Set<string>();
      const receivedPartners = new Set<string>();

      for (const c of connections) {
        if (c.sender_id === user.id) {
          sentPartners.add(c.receiver_id);
        }
        if (c.receiver_id === user.id) {
          receivedPartners.add(c.sender_id);
        }
      }

      // 3. Matched = partners who appear in BOTH sets (reciprocal connection)
      const matchedIds: string[] = [];
      for (const id of sentPartners) {
        if (receivedPartners.has(id)) {
          matchedIds.push(id);
        }
      }

      if (matchedIds.length === 0) {
        setConnectedProfiles([]);
        setLoading(false);
        return;
      }

      // 4. Fetch profiles for matched partners
      const { data: profiles, error: profError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, instruments, genres, location")
        .in("id", matchedIds);

      if (cancelled) {
        return;
      }

      if (profError) {
        setError(profError.message);
        setLoading(false);
        return;
      }

      // 5. Build profile lookup
      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.id, p]),
      );

      // 6. Fetch unread message counts per matched partner
      const { data: unreadMessages } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      const unreadMap = new Map<string, number>();
      for (const msg of unreadMessages ?? []) {
        unreadMap.set(msg.sender_id, (unreadMap.get(msg.sender_id) ?? 0) + 1);
      }

      // 7. Merge — for each matched partner, find the most recent connection date
      const merged: ConnectedProfile[] = matchedIds
        .map((partnerId) => {
          const profile = profileMap.get(partnerId);
          if (!profile) return null;

          // Find the most recent connection (either direction) for the date
          const partnerConnections = connections.filter(
            (c) =>
              (c.sender_id === user.id && c.receiver_id === partnerId) ||
              (c.sender_id === partnerId && c.receiver_id === user.id),
          );
          const mostRecent = partnerConnections.reduce(
            (latest, c) =>
              c.created_at > latest.created_at ? c : latest,
            partnerConnections[0],
          );

          return {
            connectionId: mostRecent.id,
            connectionCreatedAt: mostRecent.created_at,
            profile,
            unreadCount: unreadMap.get(partnerId) ?? 0,
          };
        })
        .filter((p): p is ConnectedProfile => p !== null)
        .sort(
          (a, b) =>
            new Date(b.connectionCreatedAt).getTime() -
            new Date(a.connectionCreatedAt).getTime(),
        );

      setConnectedProfiles(merged);
      setLoading(false);
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Render ──────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen page-gradient">
      <div className="accent-glow pointer-events-none absolute -top-40 right-0 h-150 w-150 opacity-30" />
      <div className="relative">
        <div className="mx-auto max-w-4xl px-6 pb-24 pt-16 lg:pb-32 lg:pt-20">
          <h1 className="heading-display">Messages</h1>
          <p className="mt-3 text-base text-muted">Your conversations with matched musicians</p>

          {/* Loading */}
          {isLoading && (
            <div className="mt-12 flex flex-col items-center gap-3 py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm text-muted">Loading connections...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-12 py-12 text-center">
              <p className="text-sm font-medium text-danger">Failed to load messages</p>
              <p className="mt-1 text-xs text-danger/70">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-danger/20 px-4 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/30"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && connectedProfiles.length === 0 && (
            <div className="mt-12 mx-auto max-w-md py-20 text-center">
              <div className="mb-5 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle">
                  <WaveIcon />
                </div>
              </div>
              <h2 className="heading text-xl text-foreground">
                No matches yet
              </h2>
              <p className="mt-2 text-sm text-muted">
                Discover musicians and connect — when they connect back, you&apos;ll
                see them here
              </p>
              <Link
                href="/discover"
                className="mt-6 btn-secondary inline-flex rounded-full px-5 py-2 text-sm"
              >
                Find musicians
              </Link>
            </div>
          )}

          {/* Inbox list */}
          {!isLoading && !error && connectedProfiles.length > 0 && (
            <div className="mt-12 divide-y divide-border">
              {connectedProfiles.map((item) => (
                <Link
                  key={item.connectionId}
                  href={`/messages/${item.profile.id}`}
                  className="flex items-center gap-5 py-5 transition-all hover:opacity-80"
                >
                  {/* Avatar — larger */}
                  <Avatar
                    avatarUrl={item.profile.avatar_url}
                    id={item.profile.id}
                    alt={item.profile.name ?? "Musician"}
                    className="h-16 w-16 shrink-0 rounded-full bg-accent-secondary/15 object-cover"
                  />

                  {/* Text content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.unreadCount > 0 && (
                          <span className="shrink-0 h-2.5 w-2.5 rounded-full bg-accent-secondary-light" />
                        )}
                        <h2 className="truncate text-lg font-semibold text-foreground">
                          {item.profile.name ?? "Unknown Musician"}
                        </h2>
                      </div>
                      <span className="shrink-0 text-xs text-muted">
                        {formatConnectedDate(item.connectionCreatedAt)}
                      </span>
                    </div>

                    {item.profile.instruments && item.profile.instruments.length > 0 && (
                      <p className="mt-0.5 truncate text-sm text-muted">
                        {item.profile.instruments.join(" · ")}
                      </p>
                    )}
                  </div>

                  {/* Chevron */}
                  <ChevronRightIcon />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

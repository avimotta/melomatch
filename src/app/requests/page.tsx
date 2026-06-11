"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/Avatar";
import type { Profile, Connection } from "@/lib/database.types";

// ── SVG Icons ────────────────────────────────────────────────────

function UserPlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

// ── Types ────────────────────────────────────────────────────────

type PendingRequest = {
  connectionId: string;
  connectionCreatedAt: string;
  profile: Pick<Profile, "id" | "name" | "avatar_url" | "instruments" | "genres" | "location" | "bio">;
};

// ── Helpers ──────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (date.getFullYear() !== now.getFullYear()) options.year = "numeric";
  return date.toLocaleDateString("en-US", options);
}

// ── Page ─────────────────────────────────────────────────────────

export default function RequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track which request is being acted on
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [ignoringId, setIgnoringId] = useState<string | null>(null);

  const isLoading = user ? loading : false;

  // ── Auth guard ─────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // ── Fetch pending requests ─────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    // 1. Fetch all connections involving current user
    const { data: connections, error: connError } = await supabase
      .from("connections")
      .select("id, sender_id, receiver_id, created_at")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (connError) {
      setError(connError.message);
      setLoading(false);
      return;
    }

    if (!connections || connections.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    // 2. Separate sent vs received
    const sentIds = new Set<string>();
    const receivedIds = new Set<string>();
    const receivedConnections = new Map<string, Connection>(); // sender_id → connection

    for (const c of connections) {
      if (c.sender_id === user.id) {
        sentIds.add(c.receiver_id);
      }
      if (c.receiver_id === user.id) {
        receivedIds.add(c.sender_id);
        // Store the connection for the sender (we might need to delete it)
        if (!receivedConnections.has(c.sender_id)) {
          receivedConnections.set(c.sender_id, c);
        }
      }
    }

    // 3. Pending = received but not sent back
    const pendingSenderIds: string[] = [];
    for (const id of receivedIds) {
      if (!sentIds.has(id)) {
        pendingSenderIds.push(id);
      }
    }

    if (pendingSenderIds.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    // 4. Fetch profiles for pending senders
    const { data: profiles, error: profError } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, instruments, genres, location, bio")
      .in("id", pendingSenderIds);

    if (profError) {
      setError(profError.message);
      setLoading(false);
      return;
    }

    // 5. Merge
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const merged: PendingRequest[] = pendingSenderIds
      .map((senderId) => {
        const profile = profileMap.get(senderId);
        const conn = receivedConnections.get(senderId);
        if (!profile || !conn) return null;
        return {
          connectionId: conn.id,
          connectionCreatedAt: conn.created_at,
          profile,
        };
      })
      .filter((r): r is PendingRequest => r !== null)
      .sort(
        (a, b) =>
          new Date(b.connectionCreatedAt).getTime() - new Date(a.connectionCreatedAt).getTime(),
      );

    setRequests(merged);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Accept handler ─────────────────────────────────────────────

  const handleAccept = async (senderId: string) => {
    if (!user || acceptingId) return;

    setAcceptingId(senderId);

    // Create reverse connection (user becomes sender)
    const { error: insertError } = await supabase.from("connections").insert({
      sender_id: user.id,
      receiver_id: senderId,
    });

    if (insertError) {
      console.error("Failed to accept request:", insertError.message);
      setAcceptingId(null);
      return;
    }

    // Remove from pending list
    setRequests((prev) => prev.filter((r) => r.profile.id !== senderId));
    setAcceptingId(null);
  };

  // ── Ignore handler ─────────────────────────────────────────────

  const handleIgnore = async (connectionId: string, senderId: string) => {
    if (!user || ignoringId) return;

    setIgnoringId(senderId);

    const { error: deleteError } = await supabase
      .from("connections")
      .delete()
      .eq("id", connectionId);

    if (deleteError) {
      console.error("Failed to ignore request:", deleteError.message);
      setIgnoringId(null);
      return;
    }

    // Remove from pending list
    setRequests((prev) => prev.filter((r) => r.connectionId !== connectionId));
    setIgnoringId(null);
  };

  // ── Render ─────────────────────────────────────────────────────

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
          <h1 className="heading-display">Requests</h1>
          <p className="mt-3 text-base text-muted">
            Musicians who want to connect with you
          </p>

          {/* Loading */}
          {isLoading && (
            <div className="mt-12 flex flex-col items-center gap-3 py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm text-muted">Loading requests...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-12 border-t border-border pt-12 text-center">
              <p className="text-sm font-medium text-danger">Failed to load requests</p>
              <p className="mt-1 text-xs text-danger/70">{error}</p>
              <button
                onClick={() => fetchRequests()}
                className="mt-4 rounded-full bg-danger/20 px-4 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/30"
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && requests.length === 0 && (
            <div className="mt-12 border-t border-border pt-16">
              <div className="mx-auto max-w-md text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle">
                  <UserPlusIcon />
                </div>
                <p className="mt-4 heading text-xl text-foreground">No pending requests</p>
                <p className="mt-2 text-sm text-muted">
                  When someone connects with you, their request will appear here
                </p>
                <Link
                  href="/discover"
                  className="mt-6 btn-secondary inline-flex rounded-full px-5 py-2 text-sm"
                >
                  Discover musicians
                </Link>
              </div>
            </div>
          )}

          {/* Request list */}
          {!isLoading && !error && requests.length > 0 && (
            <div className="mt-12 divide-y divide-border">
              {requests.map((req) => (
                <div
                  key={req.connectionId}
                  className="flex items-center gap-5 py-5"
                >
                  {/* Avatar */}
                  <Link href={"/profile/" + req.profile.id}>
                    <Avatar
                      avatarUrl={req.profile.avatar_url}
                      id={req.profile.id}
                      alt={req.profile.name ?? "Musician"}
                      className="h-16 w-16 shrink-0 rounded-full bg-accent-secondary/15 object-cover"
                    />
                  </Link>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link
                        href={"/profile/" + req.profile.id}
                        className="truncate text-lg font-semibold text-foreground transition-colors hover:text-accent-secondary"
                      >
                        {req.profile.name ?? "Unknown Musician"}
                      </Link>
                      <span className="shrink-0 text-xs text-muted">
                        {formatDate(req.connectionCreatedAt)}
                      </span>
                    </div>

                    {req.profile.instruments && req.profile.instruments.length > 0 && (
                      <p className="mt-0.5 truncate text-sm text-muted">
                        {req.profile.instruments.join(" · ")}
                      </p>
                    )}

                    {req.profile.location && (
                      <p className="mt-0.5 text-xs text-muted">
                        {req.profile.location}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleAccept(req.profile.id)}
                      disabled={acceptingId === req.profile.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-background transition-all hover:bg-accent-hover disabled:opacity-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {acceptingId === req.profile.id ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleIgnore(req.connectionId, req.profile.id)}
                      disabled={ignoringId === req.profile.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs text-foreground transition-colors hover:border-danger/50 hover:text-danger disabled:opacity-50"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                      {ignoringId === req.profile.id ? "Ignoring..." : "Ignore"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

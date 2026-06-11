"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/Avatar";
import type { Profile } from "@/lib/database.types";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SwipePreview from "@/components/SwipePreview";
import FeaturedMusicians from "@/components/FeaturedMusicians";
import Footer from "@/components/Footer";

// ── Types ───────────────────────────────────────────────────────────────

type RecentConnection = {
  profile: Pick<
    Profile,
    "id" | "name" | "avatar_url" | "instruments" | "genres" | "location" | "audio_url"
  >;
  connectionDate: string;
};

// ── Helpers ─────────────────────────────────────────────────────────────

function formatConnectedDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return diffDays + "d ago";

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric";
  }
  return date.toLocaleDateString("en-US", options);
}

// ── Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-light border-t-transparent" />
      </main>
    );
  }

  if (!user) {
    return <MarketingPage />;
  }

  return <DashboardPage userId={user.id} />;
}

// ── Marketing (unauthenticated) ─────────────────────────────────────────

function MarketingPage() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("SUPABASE TEST:", { data, error });
    };
    testConnection();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <SwipePreview />
        <FeaturedMusicians />

        {/* CTA Section */}
        <section className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="card relative overflow-hidden p-12 text-center sm:p-20">
            <div className="accent-glow pointer-events-none absolute -right-20 -top-20 h-60 w-60" />
            <div className="secondary-glow pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 opacity-60" />
            <div className="relative z-10">
              <h2 className="heading text-3xl sm:text-4xl">
                Ready to Find Your Sound?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted">
                Join musicians already connecting, collaborating, and creating
                together.
              </p>
              <a
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-semibold text-background transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-100"
              >
                Create Your Profile
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// ── Dashboard (authenticated) — editorial home ─────────────────────────

function DashboardPage({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [recentConnections, setRecentConnections] = useState<RecentConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch own profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (cancelled) return;
      setProfile(profileData);

      // Check if profile is missing essential fields
      setProfileMissing(
        !profileData?.name ||
        !profileData?.instruments?.length
      );

      // 2. Fetch connections
      const connFilter =
        "sender_id.eq." + userId + ",receiver_id.eq." + userId;
      const { data: connections } = await supabase
        .from("connections")
        .select("id, sender_id, receiver_id, created_at")
        .or(connFilter)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (connections) {
        const sentPartners = new Set<string>();
        const receivedPartners = new Set<string>();

        for (const c of connections) {
          if (c.sender_id === userId) sentPartners.add(c.receiver_id);
          if (c.receiver_id === userId) receivedPartners.add(c.sender_id);
        }

        const matchedIds: string[] = [];
        for (const id of sentPartners) {
          if (receivedPartners.has(id)) matchedIds.push(id);
        }

        setConnectionsCount(matchedIds.length);

        // Collect up to 8 most recent for horizontal scroll
        const recentMatchedIds = matchedIds.slice(0, 8);

        if (recentMatchedIds.length > 0) {
          const { data: partnerProfiles } = await supabase
            .from("profiles")
            .select("id, name, avatar_url, instruments, genres, location, audio_url")
            .in("id", recentMatchedIds);

          if (!cancelled && partnerProfiles) {
            const recent: RecentConnection[] = recentMatchedIds
              .map((id) => {
                const partnerProfile = partnerProfiles.find(
                  (p) => p.id === id,
                );
                if (!partnerProfile) return null;
                const partnerConns = connections.filter(
                  (c) =>
                    (c.sender_id === userId && c.receiver_id === id) ||
                    (c.sender_id === id && c.receiver_id === userId),
                );
                const mostRecent = partnerConns.reduce(
                  (latest, c) =>
                    c.created_at > latest.created_at ? c : latest,
                  partnerConns[0],
                );
                return {
                  profile: partnerProfile,
                  connectionDate: mostRecent.created_at,
                };
              })
              .filter((r): r is RecentConnection => r !== null)
              .sort(
                (a, b) =>
                  new Date(b.connectionDate).getTime() -
                  new Date(a.connectionDate).getTime(),
              );

            setRecentConnections(recent);
          }
        }
      }

      setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [userId]);

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="relative flex-1 page-gradient">
        <div className="accent-glow pointer-events-none absolute -top-40 right-0 h-150 w-150 opacity-30" />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20">

          {/* Editorial greeting — simple, no metrics */}
          <div className="pt-10">
            <h1 className="heading-display text-foreground">
              Hey{profile?.name ? ", " + profile.name : ""}
            </h1>

            {profileMissing && (
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
                Set up your profile so other musicians can find you.
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-light border-t-transparent" />
            </div>
          )}

          {/* Empty — no matches yet */}
          {!loading && connectionsCount === 0 && (
            <div className="mt-12 border-t border-border pt-10">
              <p className="text-sm leading-relaxed text-muted max-w-sm">
                When musicians connect back, they&apos;ll appear here.
              </p>
              <Link
                href="/discover"
                className="mt-4 inline-block text-xs text-accent-light underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Discover musicians &rarr;
              </Link>
            </div>
          )}

          {/* Matches — horizontal mixtape scroll */}
          {!loading && connectionsCount > 0 && (
            <section className="mt-12 border-t border-border pt-10">
              <span className="label">
                {connectionsCount} {connectionsCount === 1 ? "connection" : "connections"}
              </span>

              <div className="mt-6 flex gap-5 overflow-x-auto pb-4">
                {recentConnections.map((item) => (
                  <Link
                    key={item.profile.id}
                    href={"/messages/" + item.profile.id}
                    className="group w-32 shrink-0"
                  >
                    <div className="aspect-square overflow-hidden rounded-xl bg-linear-to-br from-accent-secondary/15 to-surface-elevated transition-all group-hover:ring-2 group-hover:ring-accent-secondary/30">
                      <Avatar
                        avatarUrl={item.profile.avatar_url}
                        id={item.profile.id}
                        alt={item.profile.name ?? "Musician"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-2 truncate text-xs font-medium text-foreground group-hover:text-accent-secondary transition-colors">
                      {item.profile.name ?? "Unknown"}
                    </p>
                    <p className="truncate text-[10px] text-muted-light">
                      {item.profile.instruments?.join(", ")}
                    </p>
                    <p className="text-[10px] text-muted-dim">
                      {formatConnectedDate(item.connectionDate)}
                    </p>
                  </Link>
                ))}
              </div>

              {connectionsCount > 8 && (
                <Link
                  href="/messages"
                  className="mt-2 inline-block text-[11px] text-foreground underline underline-offset-2 transition-colors hover:text-accent-light"
                >
                  View all connections &rarr;
                </Link>
              )}
            </section>
          )}

        </div>
      </main>
    </div>
  );
}

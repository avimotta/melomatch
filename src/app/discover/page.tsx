"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileCard from "@/components/ProfileCard";

type Profile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  instruments: string[] | null;
  genres: string[] | null;
  location: string | null;
  bio: string | null;
};

export default function DiscoverPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProfiles = async () => {
      setLoading(true);
      setError(null);

      // 1. Check auth first
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // 2. Fetch all profiles
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, instruments, genres, location, bio")
        .order("name", { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setProfiles(data ?? []);
      setLoading(false);
    };

    fetchProfiles();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-background pt-24">
      <div className="mx-auto max-w-lg px-4 pb-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Discover Musicians
          </h1>
          <p className="mt-2 text-sm text-muted">
            Find your next collaborator
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-muted">Loading musicians...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-center">
            <p className="text-sm text-red-400">Failed to load profiles</p>
            <p className="mt-1 text-xs text-red-400/70">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-full bg-red-500/20 px-4 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && profiles.length === 0 && (
          <div className="rounded-xl border border-border bg-surface px-6 py-16 text-center">
            <p className="text-lg font-medium text-foreground">
              No musicians yet
            </p>
            <p className="mt-2 text-sm text-muted">
              Be the first to create your profile!
            </p>
          </div>
        )}

        {/* Feed */}
        {!loading && !error && profiles.length > 0 && (
          <div className="flex flex-col gap-6">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

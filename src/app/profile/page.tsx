"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/Avatar";
import type { Profile } from "@/lib/database.types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Fetch state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive from user — not loading when logged out
  const isLoading = user ? loading : false;

  // Form state (arrays as comma-separated strings for editing)
  const [name, setName] = useState("");
  const [instruments, setInstruments] = useState("");
  const [genres, setGenres] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [influences, setInfluences] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  // Avatar state (optimistic for instant refresh)
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ── Auth guard ─────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // ── Fetch profile ──────────────────────────────────────────────

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (cancelled) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setProfile(data);
      setLocalAvatarUrl(data.avatar_url);
      setName(data.name ?? "");
      setInstruments(data.instruments?.join(", ") ?? "");
      setGenres(data.genres?.join(", ") ?? "");
      setExperienceLevel(data.experience_level ?? "");
      setLookingFor(data.looking_for?.join(", ") ?? "");
      setInfluences(data.influences ?? "");
      setLocation(data.location ?? "");
      setBio(data.bio ?? "");
      setLoading(false);
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Save handler ───────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || saving) return;

    setSaving(true);
    setSaveError(null);
    setSuccess(false);

    const parsedInstruments = instruments
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedGenres = genres
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedLookingFor = lookingFor
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name: name.trim() || null,
        instruments:
          parsedInstruments.length > 0 ? parsedInstruments : null,
        genres: parsedGenres.length > 0 ? parsedGenres : null,
        experience_level: experienceLevel.trim() || null,
        looking_for:
          parsedLookingFor.length > 0 ? parsedLookingFor : null,
        influences: influences.trim() || null,
        location: location.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", user.id);

    setSaving(false);

    if (updateError) {
      setSaveError(updateError.message);
      setTimeout(() => setSaveError(null), 4000);
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  // ── Generate avatar handler ────────────────────────────────────

  const handleGenerateAvatar = async () => {
    if (!user || generating) return;

    setGenerating(true);

    const seed = Math.random().toString(36).substring(2, 10);
    const url = "https://api.dicebear.com/7.x/notionists/svg?seed=" + seed;

    // Optimistic update
    setLocalAvatarUrl(url);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", user.id);

    if (updateError) {
      // Revert on failure
      setLocalAvatarUrl(profile?.avatar_url ?? null);
      setSaveError(updateError.message);
      setTimeout(() => setSaveError(null), 4000);
    }

    setGenerating(false);
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
      <div className="accent-glow pointer-events-none absolute -top-40 right-0 h-125 w-125 opacity-30" />
      <div className="relative">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-16 lg:pb-32 lg:pt-20">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm text-muted">Loading profile...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-danger">Failed to load profile</p>
              <p className="mt-1 text-xs text-danger/70">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-danger/20 px-4 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/30"
              >
                Try again
              </button>
            </div>
          )}

          {/* Form */}
          {!isLoading && !error && profile && (
            <>
              {/* Success banner */}
              {success && (
                <div className="mb-8 border-t border-accent/20 py-4">
                  <p className="text-sm font-medium text-accent">Profile updated</p>
                </div>
              )}

              {/* Error banner */}
              {saveError && (
                <div className="mb-8 border-t border-danger/20 py-4">
                  <p className="text-sm text-danger">{saveError}</p>
                </div>
              )}

              <h1 className="heading-display">Edit your profile</h1>
              <p className="mt-3 max-w-lg text-base text-muted">Make it yours</p>

              <form onSubmit={handleSave} className="mt-12 space-y-8">
                {/* Avatar */}
                <div className="flex items-center gap-5 pb-4">
                  <Avatar
                    avatarUrl={localAvatarUrl}
                    id={user!.id}
                    alt={profile.name ?? "Your avatar"}
                    className="h-16 w-16 shrink-0 rounded-full bg-accent/10 object-cover ring-2 ring-border"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAvatar}
                    disabled={generating}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent transition-all hover:bg-accent/20 active:scale-95 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                        Generate New Avatar
                      </>
                    )}
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="mb-2 block label">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border-b border-border bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-dim transition-colors focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Instruments */}
                <div>
                  <label htmlFor="instruments" className="mb-2 block label">Instruments</label>
                  <input
                    id="instruments"
                    type="text"
                    value={instruments}
                    onChange={(e) => setInstruments(e.target.value)}
                    placeholder="Guitar, Piano, Drums"
                    className="w-full border-b border-border bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-dim transition-colors focus:border-accent focus:outline-none"
                  />
                  <p className="mt-1.5 text-xs text-muted-light">Separate with commas</p>
                </div>

                {/* Genres */}
                <div>
                  <label htmlFor="genres" className="mb-2 block label">Genres</label>
                  <input
                    id="genres"
                    type="text"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                    placeholder="Rock, Jazz, Electronic"
                    className="w-full border-b border-border bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-dim transition-colors focus:border-accent focus:outline-none"
                  />
                  <p className="mt-1.5 text-xs text-muted-light">Separate with commas</p>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="mb-2 block label">Location</label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                    className="w-full border-b border-border bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-dim transition-colors focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Experience Level */}
                <div>
                  <label htmlFor="experience_level" className="mb-2 block label">Experience Level</label>
                  <select
                    id="experience_level"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full border-b border-border bg-transparent px-0 py-3 text-base text-foreground transition-colors focus:border-accent focus:outline-none"
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>

                {/* Looking For */}
                <div>
                  <label htmlFor="looking_for" className="mb-2 block label">Looking For</label>
                  <input
                    id="looking_for"
                    type="text"
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    placeholder="Band members, Session work, Collaboration"
                    className="w-full border-b border-border bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-dim transition-colors focus:border-accent focus:outline-none"
                  />
                  <p className="mt-1.5 text-xs text-muted-light">Separate with commas</p>
                </div>

                {/* Influences */}
                <div>
                  <label htmlFor="influences" className="mb-2 block label">Influences</label>
                  <textarea
                    id="influences"
                    rows={2}
                    value={influences}
                    onChange={(e) => setInfluences(e.target.value)}
                    placeholder="Artists, bands, or styles that inspire you"
                    className="w-full resize-none border-b border-border bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-dim transition-colors focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="mb-2 block label">Bio</label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell other musicians about yourself..."
                    className="w-full resize-none border-b border-border bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-dim transition-colors focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Submit */}
                <div className="border-t border-border pt-8">
                  <button
                    type="submit"
                    disabled={saving || success}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-semibold text-surface transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                        Saving…
                      </>
                    ) : success ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Saved
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

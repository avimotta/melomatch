"use client";

type Profile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  instruments: string[] | null;
  genres: string[] | null;
  location: string | null;
  bio: string | null;
};

export default function ProfileCard({ profile }: { profile: Profile }) {
  const initial = (profile.name ?? "?")[0].toUpperCase();

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-border/80">
      {/* Cover / header area */}
      <div className="relative h-48 bg-gradient-to-br from-accent/20 via-accent/5 to-surface">
        {/* Avatar */}
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name ?? "Musician"}
            className="absolute -bottom-10 left-6 h-20 w-20 rounded-full border-4 border-surface object-cover"
          />
        ) : (
          <div className="absolute -bottom-10 left-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface bg-accent/20 text-2xl font-bold text-accent">
            {initial}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-6 pb-6 pt-14">
        {/* Name + location */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {profile.name ?? "Unknown Musician"}
            </h2>
            {profile.location && (
              <p className="mt-0.5 text-sm text-muted/70">{profile.location}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
            {profile.bio}
          </p>
        )}

        {/* Instruments */}
        {profile.instruments && profile.instruments.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted/50">
              Instruments
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.instruments.map((inst) => (
                <span
                  key={inst}
                  className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                >
                  {inst}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Genres */}
        {profile.genres && profile.genres.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted/50">
              Genres
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-muted"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Connect button */}
        <button className="mt-5 w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-black transition-all hover:bg-accent-hover hover:scale-[1.02] active:scale-100">
          Connect
        </button>
      </div>
    </div>
  );
}

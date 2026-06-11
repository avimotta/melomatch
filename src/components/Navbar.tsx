"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/Avatar";

function MusicNoteIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fetchedAvatarUrl, setFetchedAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive from user — null/0 when logged out, no effect needed
  const profileAvatarUrl = user ? fetchedAvatarUrl : null;
  const displayUnreadCount = user ? unreadCount : 0;
  const displayPendingRequestCount = user ? pendingRequestCount : 0;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch profile avatar
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled && data) {
          setFetchedAvatarUrl(data.avatar_url);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ── Fetch unread message count ──────────────────────────────────
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false)
      .then(({ count }) => {
        if (!cancelled) setUnreadCount(count ?? 0);
      });

    return () => {
      cancelled = true;
    };
  }, [user, pathname]);

  // ── Fetch pending request count ────────────────────────────────
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchPendingCount = async () => {
      const { data: connections } = await supabase
        .from("connections")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (cancelled || !connections) return;

      const sentIds = new Set<string>();
      const receivedIds = new Set<string>();

      for (const c of connections) {
        if (c.sender_id === user.id) sentIds.add(c.receiver_id);
        if (c.receiver_id === user.id) receivedIds.add(c.sender_id);
      }

      let pending = 0;
      for (const id of receivedIds) {
        if (!sentIds.has(id)) pending++;
      }

      if (!cancelled) setPendingRequestCount(pending);
    };

    fetchPendingCount();

    return () => {
      cancelled = true;
    };
  }, [user, pathname]);

  // ── Reset fetch-based state on logout ──────────────────────────
  useEffect(() => {
    if (!user) {
      setFetchedAvatarUrl(null);
      setUnreadCount(0);
      setPendingRequestCount(0);
    }
  }, [user]);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <MusicNoteIcon />
          <span className="heading text-sm tracking-tight text-foreground">
            MeloMatch
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/discover">Discover</NavLink>
          <NavLink href="/messages" badge={displayUnreadCount}>Messages</NavLink>
          <NavLink href="/requests" badge={displayPendingRequestCount}>Requests</NavLink>

          <div className="flex items-center gap-2 pl-3">
            {loading ? (
              <div className="h-5 w-5 animate-pulse rounded-full bg-border" />
            ) : user ? (
              /* Logged in — avatar dropdown */
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-border-light transition-all hover:ring-accent-secondary/50"
                >
                  <Avatar
                    avatarUrl={profileAvatarUrl}
                    id={user.id}
                    alt={user.email ?? "Profile"}
                    className="h-full w-full rounded-full bg-accent-subtle object-cover"
                  />
                </button>

                {isDropdownOpen && (
                  <div className="card-elevated absolute right-0 mt-2 w-48 overflow-hidden">
                    <div className="border-b border-border px-4 py-2.5">
                      <p className="truncate text-xs text-muted">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs text-foreground transition-colors hover:bg-surface-hover"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs text-foreground transition-colors hover:bg-surface-hover"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Logged out */
              <>
                <Link
                  href="/login?tab=login"
                  className="text-xs font-medium text-foreground transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-background transition-all hover:bg-accent-hover"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex flex-col gap-1 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={"block h-px w-4 rounded-full bg-foreground transition-all " +
              (isMobileOpen ? "translate-y-1 rotate-45" : "")
            }
          />
          <span
            className={"block h-px w-4 rounded-full bg-foreground transition-all " +
              (isMobileOpen ? "opacity-0" : "")
            }
          />
          <span
            className={"block h-px w-4 rounded-full bg-foreground transition-all " +
              (isMobileOpen ? "-translate-y-1 -rotate-45" : "")
            }
          />
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="border-t border-border/30 bg-background/95 px-6 pb-6 pt-4 md:hidden">
          <div className="flex flex-col gap-3">
            <MobileNavLink href="/" onClick={() => setIsMobileOpen(false)}>
              Home
            </MobileNavLink>
            <MobileNavLink href="/discover" onClick={() => setIsMobileOpen(false)}>
              Discover
            </MobileNavLink>
            <MobileNavLink
              href="/messages"
              onClick={() => setIsMobileOpen(false)}
              badge={displayUnreadCount}
            >
              Messages
            </MobileNavLink>
            <MobileNavLink
              href="/requests"
              onClick={() => setIsMobileOpen(false)}
              badge={displayPendingRequestCount}
            >
              Requests
            </MobileNavLink>
            <hr className="border-border/30" />

            {user ? (
              <>
                <div className="flex items-center gap-2.5">
                  <Avatar
                    avatarUrl={profileAvatarUrl}
                    id={user.id}
                    alt={user.email ?? "Profile"}
                    className="h-7 w-7 rounded-full bg-accent-subtle object-cover"
                  />
                  <span className="text-xs text-muted">{user.email}</span>
                </div>
                <Link
                  href="/profile"
                  className="text-xs font-medium text-foreground transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileOpen(false);
                  }}
                  className="text-left text-xs font-medium text-foreground transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login?tab=login"
                  className="text-xs font-medium text-foreground transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-background"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  badge,
  children,
}: {
  href: string;
  badge?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={
        "relative py-2 text-xs transition-colors " +
        (isActive
          ? "text-foreground"
          : "text-foreground")
      }
    >
      <span className="tracking-wide uppercase">{children}</span>
      {isActive && (
        <span className="absolute top-0 left-1/2 h-px w-6 -translate-x-1/2 bg-accent" />
      )}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 -right-3 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent-secondary px-1 text-[9px] font-bold text-background leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

function MobileNavLink({
  href,
  badge,
  children,
  onClick,
}: {
  href: string;
  badge?: number;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={
        "text-xs tracking-wide uppercase transition-colors " +
        (isActive
          ? "text-foreground"
          : "text-foreground")
      }
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-2">
        {children}
        {badge !== undefined && badge > 0 && (
          <span className="flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent-secondary px-1 text-[9px] font-bold text-background leading-none">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
    </Link>
  );
}

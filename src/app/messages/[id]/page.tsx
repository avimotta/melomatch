"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Avatar from "@/components/Avatar";
import type { Profile, Message } from "@/lib/database.types";

// ── SVG Icons ──────────────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="0" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-US", timeOpts);
  }
  if (isYesterday) {
    return "Yesterday " + date.toLocaleTimeString("en-US", timeOpts);
  }

  if (date.getFullYear() === now.getFullYear()) {
    return (
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " " +
      date.toLocaleTimeString("en-US", timeOpts)
    );
  }

  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " " +
    date.toLocaleTimeString("en-US", timeOpts)
  );
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });
}

// ── Page ────────────────────────────────────────────────────────────────

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const profileId = params.id as string;

  // Initial load state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive from user — not loading when logged out
  const isLoading = user ? loading : false;

  // Profile + match
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMatched, setIsMatched] = useState(false);

  // Messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Send
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Auth guard ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // ── Fetch profile + match + messages ────────────────────────────────

  useEffect(() => {
    if (!user) return;

    // profileId is guaranteed by the [id] route segment
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // 1. Fetch the other user's profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, location, bio, instruments, genres, experience_level, looking_for, influences, email")
        .eq("id", profileId)
        .single();

      if (cancelled) return;

      if (profileError) {
        if (profileError.code === "PGRST116") {
          setProfile(null);
          setLoading(false);
          return;
        }
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // 2. Check reciprocal match
      const { data: connections } = await supabase
        .from("connections")
        .select("sender_id, receiver_id")
        .or(
          "sender_id.eq." + user.id + ",receiver_id.eq." + user.id,
        );

      if (cancelled) return;

      const sentToThem = (connections ?? []).some(
        (c) => c.sender_id === user.id && c.receiver_id === profileId,
      );
      const receivedFromThem = (connections ?? []).some(
        (c) => c.sender_id === profileId && c.receiver_id === user.id,
      );
      const matched = sentToThem && receivedFromThem;
      setIsMatched(matched);

      // 3. Fetch messages (only if matched)
      if (matched) {
        const { data: msgData, error: msgError } = await supabase
          .from("messages")
          .select("id, sender_id, receiver_id, content, created_at, is_read")
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
          )
          .order("created_at", { ascending: true });

        if (cancelled) return;

        if (msgError) {
          setMessagesError(msgError.message);
        } else {
          setMessages(msgData ?? []);

          // Mark received unread messages as read (fire-and-forget)
          const hasUnread = (msgData ?? []).some(
            (m) =>
              m.sender_id === profileId &&
              m.receiver_id === user.id &&
              !m.is_read,
          );

          if (hasUnread) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("receiver_id", user.id)
              .eq("sender_id", profileId)
              .eq("is_read", false)
              .then(({ error: updateError }) => {
                if (updateError) {
                  console.error("Failed to mark messages as read:", updateError);
                }
              });
          }
        }
      }

      setLoading(false);
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [user, profileId]);

  // ── Auto-scroll to newest message ──────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send handler ───────────────────────────────────────────────────

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!user || !profile || !trimmed || sending || !isMatched) return;

    setSending(true);
    setSendError(null);

    const { error: insertError } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: profileId,
      content: trimmed,
    });

    if (insertError) {
      setSendError(insertError.message);
      setTimeout(() => setSendError(null), 4000);
      setSending(false);
      return;
    }

    // Optimistic update — insert into local state immediately
    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      sender_id: user.id,
      receiver_id: profileId,
      content: trimmed,
      created_at: new Date().toISOString(),
      is_read: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputValue("");
    setSending(false);
    inputRef.current?.focus();
  };

  // ── Keyboard handler (Enter to send, Shift+Enter for newline) ─────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ──────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen page-gradient pt-24">
      <div className="accent-glow pointer-events-none absolute top-0 right-0 h-100 w-100 opacity-20" />
      <div className="relative mx-auto flex max-w-3xl flex-col px-6 h-[calc(100vh-6rem)]">
        {/* ── Back link ─────────────────────────────────────────── */}
        <div className="shrink-0 pt-2">
          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-accent"
          >
            <ChevronLeftIcon />
            Back to Messages
          </Link>
        </div>

        {/* ── Loading state ─────────────────────────────────────── */}
        {isLoading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-muted">Loading conversation...</p>
          </div>
        )}

        {/* ── Error state (initial load error) ──────────────────── */}
        {!isLoading && error && (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="card border-danger/20 bg-danger/10 px-6 py-6">
              <p className="text-sm font-medium text-danger">
                Failed to load
              </p>
              <p className="mt-2 text-xs text-danger/70">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full bg-danger/20 px-4 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/30"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ── Profile not found ─────────────────────────────────── */}
        {!isLoading && !error && !profile && (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle">
              <SearchIcon />
            </div>
            <p className="heading text-xl text-foreground">
              Profile not found
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              This musician doesn&apos;t exist or their profile has been
              removed.
            </p>
            <Link
              href="/messages"
              className="mt-6 btn-secondary px-5 py-2 text-sm"
            >
              Back to Messages
            </Link>
          </div>
        )}

        {/* ── Not matched ───────────────────────────────────────── */}
        {!isLoading && !error && profile && !isMatched && (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle">
              <LockIcon />
            </div>
            <p className="heading text-xl text-foreground">
              Not connected
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              You can only message musicians you&apos;ve matched with.
            </p>
            <Link
              href="/messages"
              className="mt-6 btn-secondary px-5 py-2 text-sm"
            >
              Back to Messages
            </Link>
          </div>
        )}

        {/* ── Chat UI ───────────────────────────────────────────── */}
        {!isLoading && !error && profile && isMatched && (
          <>
            {/* ── Chat header ─────────────────────────────────── */}
            <div className="shrink-0 border-b border-border py-5">
              <div className="flex items-center gap-3">
                <Link href={"/profile/" + profile.id}>
                  <Avatar
                    avatarUrl={profile.avatar_url}
                    id={profile.id}
                    alt={profile.name ?? "Musician"}
                    className="h-11 w-11 shrink-0 rounded-full bg-accent-secondary/15 object-cover ring-2 ring-border-light transition-all hover:opacity-80"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={"/profile/" + profile.id}
                    className="heading text-sm text-foreground transition-colors hover:text-accent"
                  >
                    {profile.name ?? "Unknown Musician"}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {profile.instruments && profile.instruments.length > 0 && (
                      <span className="text-[11px] text-muted-light">
                        {profile.instruments.join(", ")}
                      </span>
                    )}
                    {profile.instruments &&
                      profile.instruments.length > 0 &&
                      profile.location && (
                        <span className="text-[10px] text-muted-dim">
                          ·
                        </span>
                      )}
                    {profile.location && (
                      <span className="text-[11px] text-muted">
                        {profile.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Message list ─────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {messagesError && (
                <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-center">
                  <p className="text-xs text-danger">
                    Failed to load messages
                  </p>
                  <p className="mt-1 text-[11px] text-danger/70">
                    {messagesError}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 rounded-full bg-danger/20 px-3 py-1 text-[11px] font-medium text-danger transition-colors hover:bg-danger/30"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!messagesError && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-subtle">
                    <WaveIcon />
                  </div>
                  <p className="heading text-lg text-foreground">
                    No messages yet
                  </p>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
                    Say something to start the conversation
                  </p>
                </div>
              )}

              {(() => {
                let lastDate: string | null = null;
                return messages.map((msg) => {
                  const msgDate = new Date(msg.created_at).toDateString();
                  const showDateDivider = msgDate !== lastDate;
                  lastDate = msgDate;
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <React.Fragment key={msg.id}>
                      {showDateDivider && (
                        <div className="flex justify-center py-2">
                          <span className="rounded-full bg-surface-elevated px-3 py-1 text-[10px] font-medium text-muted-light">
                            {getDateLabel(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div
                        className={
                          "flex " +
                          (isOwn ? "justify-end" : "justify-start")
                        }
                      >
                        <div
                          className={
                            "max-w-[75%] px-5 py-3 " +
                            (isOwn ? "bubble-own" : "bubble-other")
                          }
                        >
                          <p
                            className={
                              "text-sm whitespace-pre-wrap wrap-break-word " +
                              (isOwn
                                ? "text-foreground"
                                : "text-surface")
                            }
                          >
                            {msg.content}
                          </p>
                          <p
                            className={
                              "mt-0.5 text-[10px] " +
                              (isOwn
                                ? "text-right text-muted"
                                : "text-left text-white/65")
                            }
                          >
                            {formatMessageTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                });
              })()}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input area ───────────────────────────────────── */}
            <div className="shrink-0 border-t border-border bg-background py-4">
              {/* Send error banner */}
              {sendError && (
                <div className="mb-2 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-center">
                  <p className="text-xs text-danger">{sendError}</p>
                </div>
              )}

              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className={
                    "min-h-11 flex-1 resize-none rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-dim transition-all focus:border-accent/50 focus:ring-2 focus:ring-accent/15 focus:outline-none"
                  }
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || sending}
                  className={
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all " +
                    (inputValue.trim() && !sending
                        ? "bg-accent text-background hover:bg-accent-hover hover:scale-105"
                      : "bg-surface text-muted-dim cursor-not-allowed")
                  }
                >
                  {sending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-muted-dim">
                Enter to send &middot; Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

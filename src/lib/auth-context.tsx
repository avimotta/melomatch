"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(`🔐 AUTH PROVIDER MOUNT`, { loading, hasUser: !!user });
  }, [loading, user]);

  useEffect(() => {
    console.log(`🔐 AUTH PROVIDER STATE`, { loading, hasUser: !!user });
  }, [loading, user]);

  useEffect(() => {
    const path = window.location.pathname;
    console.log(`🔐 AUTH MOUNT [${path}] — starting INITIAL_SESSION wait`);

    // ── Two sources for the current session ──
    //
    // 1. onAuthStateChange fires INITIAL_SESSION synchronously on subscribe
    //    — reads from storage, NO network request, cannot hang.
    //
    // 2. getSession() may refresh an expired token (network request).
    //    Internally uses gotrue's _acquireLock(-1) which can hang forever
    //    if the mutex lock was leaked by a previous failed refresh.
    //
    // Strategy: INITIAL_SESSION resolves loading immediately (path 1).
    // getSession() updates user in the background if a refresh occurred (path 2).
    // A timeout guarantees loading resolves even in the hanging-lock case.
    // ─────────────────────────────────────────────────────────────────

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        console.log(`🔐 AUTH EVENT [${path}] event=${event} hasSession=${!!session}`);
        setUser(session?.user ?? null);

        // INITIAL_SESSION fires immediately after subscribing —
        // use it to signal that auth state is known.
        if (event === "INITIAL_SESSION") {
          console.log(`🔐 AUTH SET LOADING=false [${path}] via INITIAL_SESSION`);
          setLoading(false);
        }
      });

    // Background: attempt to get / refresh the session.
    // This may hang, so it's NOT relied on for loading state.
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        console.log(`🔐 AUTH getSession resolved [${path}] hasSession=${!!session}`);
        setUser(session?.user ?? null);
      })
      .catch((err) => {
        console.error("Failed to get auth session:", err);
      });

    // Safety timeout: if both paths fail (e.g. gotrue lock leak),
    // force resolve loading so the UI is interactive.
    const FALLBACK_TIMEOUT_MS = 3_000;
    const fallbackTimeout = setTimeout(() => {
      console.log(`🔐 AUTH SET LOADING=false [${path}] via FALLBACK TIMEOUT`);
      setLoading(false);
    }, FALLBACK_TIMEOUT_MS);

    return () => {
      console.log(`🔐 AUTH UNMOUNT [${path}] — cleaning up subscription + timeout`);
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will fire and set user to null
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

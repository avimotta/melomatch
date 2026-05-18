"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setSubmitting(false);
        return;
      }

      // Create profile for new user
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.email?.split("@")[0],
            instruments: [],
            genres: [],
            location: "",
            bio: "",
          });

        if (profileError) {
          console.error("Profile creation failed:", profileError);
          // Still redirect — profile can be completed later
        }
      }

      router.push("/discover");
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setSubmitting(false);
        return;
      }

      router.push("/discover");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <a
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-foreground"
        >
          <span className="text-2xl">🎵</span>
          <span className="text-lg font-bold tracking-tight">MeloMatch</span>
        </a>

        <div className="rounded-xl border border-border bg-surface p-6">
          {/* Tabs */}
          <div className="mb-6 flex rounded-lg bg-background p-1">
            <button
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-accent text-black"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-accent text-black"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="text-xl font-bold text-foreground">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "signup"
              ? "Start finding your next collaborator"
              : "Sign in to continue discovering"}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />

            <input
              type="password"
              placeholder="Password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />

            {error && (
              <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full bg-accent py-3 text-sm font-semibold text-black transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Please wait..."
                : mode === "signup"
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:text-foreground">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}

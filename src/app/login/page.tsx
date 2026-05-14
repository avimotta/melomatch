"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("SIGN UP:", { data, error });

    if (error) return;

    const user = data.user;

    if (user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          email: user.email,
          name: user.email?.split("@")[0],
          instruments: [],
          genres: [],
          location: "",
          bio: "",
        },
      ]);

      console.log("PROFILE CREATE:", profileError);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-white/10 bg-zinc-900 p-6">
        <h1 className="text-2xl font-bold">Create Account</h1>

        <input
          type="email"
          placeholder="Email"
          className="rounded-md bg-zinc-800 p-3 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="rounded-md bg-zinc-800 p-3 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignUp}
          className="rounded-md bg-white p-3 font-semibold text-black"
        >
          Sign Up
        </button>

        {user && (
          <div className="mt-4 rounded-md bg-green-500/20 p-3 text-sm">
            Logged in as: {user.email}
          </div>
        )}
      </div>
    </div>
  );
}

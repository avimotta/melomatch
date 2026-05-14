'use client';
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SwipePreview from "@/components/SwipePreview";
import FeaturedMusicians from "@/components/FeaturedMusicians";
import Footer from "@/components/Footer";

export default function Home() {
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
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent/5 via-surface to-accent/5 p-12 text-center sm:p-20">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/10 blur-[80px]" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Find Your Sound?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted">
                Join thousands of musicians already connecting, collaborating,
                and creating together.
              </p>
              <a
                href="#"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-sm font-bold text-black transition-all hover:bg-accent-hover hover:scale-105"
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

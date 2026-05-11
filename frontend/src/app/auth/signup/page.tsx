"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="relative w-14 h-14 mx-auto mb-7">
            <div className="absolute inset-0 border border-accent rotate-45" />
            <div className="absolute inset-2 border border-accent/40 rotate-[22deg]" />
          </div>
          <p className="font-ui text-[10px] font-bold uppercase tracking-[0.28em] text-accent mb-3">
            Almost there
          </p>
          <h1 className="font-display text-3xl font-light text-primary leading-tight mb-4">
            Check your email
          </h1>
          <p className="font-ui text-sm text-muted leading-relaxed">
            We sent a confirmation link to <span className="text-primary">{email}</span>.
            Click it to activate your account.
          </p>
          <p className="mt-6 font-ui text-xs text-muted">
            Already confirmed?{" "}
            <Link href="/auth/login" className="text-accent hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex items-center gap-3 mb-10">
          <div className="relative w-5 h-5 flex-shrink-0">
            <div className="absolute inset-0 border border-accent rotate-45 scale-[0.72]" />
            <div className="absolute inset-0 border border-accent/35 rotate-[22deg] scale-90" />
          </div>
          <span className="font-ui text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            Lead Qualifier
          </span>
        </div>

        <p className="font-ui text-[10px] font-bold uppercase tracking-[0.28em] text-accent mb-3">
          Get started
        </p>
        <h1 className="font-display text-4xl font-light text-primary leading-tight mb-8">
          Create your account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="field-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="field-input"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="border border-red-900/40 bg-red-950/20 px-4 py-3">
              <p className="font-ui text-xs text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              group relative w-full h-12 overflow-hidden
              border border-accent/30 bg-accent/5
              hover:border-accent hover:bg-accent/10
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-3
            "
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {loading ? (
              <span className="relative flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-accent animate-bounce"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </span>
            ) : (
              <span className="relative font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                Create Account
              </span>
            )}
          </button>
        </form>

        <p className="mt-6 font-ui text-xs text-muted text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-accent hover:text-primary transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import LeadForm from "@/components/LeadForm";
import QualificationResult from "@/components/QualificationResult";

interface RunSession {
  runId: string;
  publicToken: string;
}

export default function HomePage() {
  const [session, setSession] = useState<RunSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(formData: Record<string, string>) {
    setIsSubmitting(true);
    setSubmitError(null);
    setSession(null);

    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const data = (await res.json()) as {
        runId: string;
        publicToken: string;
      };
      setSession(data);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Unknown error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="border-b border-dim">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Diamond mark */}
            <div className="relative w-5 h-5 flex-shrink-0">
              <div className="absolute inset-0 border border-accent rotate-45 scale-[0.72]" />
              <div className="absolute inset-0 border border-accent/35 rotate-[22deg] scale-90" />
            </div>
            <span className="font-ui text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              Lead Qualifier
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-ui font-semibold uppercase tracking-[0.18em] text-ghost">
            <span>Trigger.dev</span>
            <span className="text-mid">·</span>
            <span>DeepSeek</span>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12 md:py-20">
        {/* Hero title */}
        <div className="mb-12 md:mb-16">
          <p className="font-ui text-[10px] font-bold uppercase tracking-[0.28em] text-accent mb-4">
            Intelligence Brief
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-light text-primary leading-[1.05] tracking-tight">
            Qualify your{" "}
            <em className="not-italic italic text-accent">lead</em>
          </h1>
          <p className="mt-4 font-ui text-sm text-muted max-w-xs leading-relaxed">
            Fill in the prospect&rsquo;s details. Our AI analyses and scores
            in real time.
          </p>
        </div>

        {/* Two-column grid: form | result */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-10 xl:gap-16 items-start">
          {/* Left — Form */}
          <div>
            <LeadForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

            {submitError && (
              <div className="mt-5 border border-red-900/40 bg-red-950/20 px-5 py-3.5">
                <p className="font-ui text-xs text-red-400">{submitError}</p>
              </div>
            )}
          </div>

          {/* Right — Result (sticky) */}
          <div className="lg:sticky lg:top-10">
            <QualificationResult
              runId={session?.runId ?? null}
              publicToken={session?.publicToken ?? null}
            />
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-dim py-5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-ghost">
            Phase IV — AI Systems
          </span>
          <span className="font-mono text-[10px] text-ghost">
            proj_gwuusnkyphlcwsgbklon
          </span>
        </div>
      </footer>
    </div>
  );
}

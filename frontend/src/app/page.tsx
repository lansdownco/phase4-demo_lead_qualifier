"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import QualificationResult from "@/components/QualificationResult";
import UpgradePrompt from "@/components/UpgradePrompt";
import SuccessBanner from "@/components/SuccessBanner";
import { createClient } from "@/lib/supabase/client";

interface RunSession {
  runId: string;
  publicToken: string;
}

export default function HomePage() {
  const router = useRouter();
  const [session, setSession] = useState<RunSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [limitReached, setLimitReached] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [subscription, setSubscription] = useState<{ status: string } | null>(null);

  useEffect(() => {
    fetch("/api/user/status")
      .then((r) => r.json())
      .then((d) => {
        setSubscription(d.subscription ?? null);
        setTodayCount(d.todayCount ?? 0);
      })
      .catch(() => {});

    if (window.location.search.includes("upgraded=true")) {
      setShowSuccessBanner(true);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const isPro = subscription?.status === "active";

  async function handleSubmit(formData: Record<string, string>) {
    setIsSubmitting(true);
    setSubmitError(null);
    setSession(null);
    setLimitReached(false);

    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.status === 429) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          usageCount?: number;
        };
        if (data.error === "limit_reached") {
          setLimitReached(true);
          setTodayCount(data.usageCount ?? 2);
          return;
        }
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const data = (await res.json()) as { runId: string; publicToken: string };
      setSession(data);
      setTodayCount((c) => c + 1);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpgrade() {
    setIsUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch {
      setIsUpgrading(false);
    }
  }

  async function handleManageSubscription() {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch {}
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {showSuccessBanner && (
        <SuccessBanner onDismiss={() => setShowSuccessBanner(false)} />
      )}

      {/* ── Header ──────────────────────────────────────── */}
      <header className="border-b border-dim">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-5 h-5 flex-shrink-0">
              <div className="absolute inset-0 border border-accent rotate-45 scale-[0.72]" />
              <div className="absolute inset-0 border border-accent/35 rotate-[22deg] scale-90" />
            </div>
            <span className="font-ui text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              Lead Qualifier
            </span>
            {isPro && (
              <span className="font-ui text-[9px] font-bold uppercase tracking-[0.18em] text-hot border border-hot/30 px-2 py-0.5">
                Pro
              </span>
            )}
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 text-[10px] font-ui font-semibold uppercase tracking-[0.18em] text-ghost">
              <span>Trigger.dev</span>
              <span className="text-mid">·</span>
              <span>DeepSeek</span>
            </div>
            {!isPro && (
              <span className="font-ui text-[10px] font-semibold tabular-nums text-ghost">
                {todayCount} / 2 today
              </span>
            )}
            <div className="w-px h-4 bg-dim" />
            {isPro && (
              <button
                onClick={handleManageSubscription}
                className="font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-muted hover:text-primary transition-colors"
              >
                Manage Plan
              </button>
            )}
            <Link
              href="/history"
              className="font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-muted hover:text-primary transition-colors"
            >
              History
            </Link>
            <button
              onClick={handleSignOut}
              className="font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-ghost hover:text-muted transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12 md:py-20">
        <div className="mb-12 md:mb-16">
          <p className="font-ui text-[10px] font-bold uppercase tracking-[0.28em] text-accent mb-4">
            Intelligence Brief
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-light text-primary leading-[1.05] tracking-tight">
            Qualify your{" "}
            <em className="not-italic italic text-accent">lead</em>
          </h1>
          <p className="mt-4 font-ui text-sm text-muted max-w-xs leading-relaxed">
            Fill in the prospect&rsquo;s details. Our AI analyses and scores in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-10 xl:gap-16 items-start">
          <div>
            <LeadForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            {submitError && (
              <div className="mt-5 border border-red-900/40 bg-red-950/20 px-5 py-3.5">
                <p className="font-ui text-xs text-red-400">{submitError}</p>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-10">
            {limitReached ? (
              <UpgradePrompt
                usedCount={todayCount}
                onUpgrade={handleUpgrade}
                isLoading={isUpgrading}
              />
            ) : (
              <QualificationResult
                runId={session?.runId ?? null}
                publicToken={session?.publicToken ?? null}
              />
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-dim py-5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-ghost">
            Phase IV — AI Systems
          </span>
          <span className="font-mono text-[10px] text-ghost">proj_gwuusnkyphlcwsgbklon</span>
        </div>
      </footer>
    </div>
  );
}

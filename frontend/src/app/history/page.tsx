import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface LeadRun {
  id: string;
  run_id: string;
  company_name: string;
  industry: string;
  score: number | null;
  tier: "Hot" | "Warm" | "Cold" | null;
  created_at: string;
}

const TIER_STYLES = {
  Hot: { text: "text-hot", border: "border-hot/30", dot: "bg-hot" },
  Warm: { text: "text-warm", border: "border-warm/30", dot: "bg-warm" },
  Cold: { text: "text-cold", border: "border-cold/30", dot: "bg-cold" },
};

function TierBadge({ tier }: { tier: "Hot" | "Warm" | "Cold" }) {
  const s = TIER_STYLES[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[10px] font-semibold font-ui uppercase tracking-[0.16em] ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {tier}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function HistoryPage() {
  const supabase = createClient();
  const { data: runs } = await supabase
    .from("lead_runs")
    .select("id, run_id, company_name, industry, score, tier, created_at")
    .order("created_at", { ascending: false });

  const items = (runs ?? []) as LeadRun[];

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
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
          </div>
          <Link
            href="/"
            className="font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-muted hover:text-primary transition-colors"
          >
            ← New Analysis
          </Link>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 py-12 md:py-20">
        <div className="mb-12">
          <p className="font-ui text-[10px] font-bold uppercase tracking-[0.28em] text-accent mb-4">
            Your Records
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-light text-primary leading-[1.05] tracking-tight">
            Lead{" "}
            <em className="not-italic italic text-accent">history</em>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative w-14 h-14 mb-7">
              <div className="absolute inset-0 border border-mid rotate-45" />
              <div className="absolute inset-2 border border-dim rotate-[22deg]" />
              <div className="absolute inset-4 border border-ghost rotate-[10deg]" />
            </div>
            <p className="font-display text-2xl font-light text-muted italic mb-2">No analyses yet</p>
            <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-ghost mb-6">
              Run your first lead qualification to see results here
            </p>
            <Link
              href="/"
              className="font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-accent hover:text-primary transition-colors"
            >
              Analyse a lead →
            </Link>
          </div>
        ) : (
          <div className="border border-dim">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_160px_100px_80px_120px] gap-4 px-6 py-3 border-b border-dim bg-surface">
              {["Company", "Industry", "Tier", "Score", "Date"].map((h) => (
                <span
                  key={h}
                  className="font-ui text-[9px] font-semibold uppercase tracking-[0.22em] text-ghost"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {items.map((run, i) => (
              <div
                key={run.id}
                className={`grid grid-cols-[1fr_160px_100px_80px_120px] gap-4 px-6 py-4 items-center ${
                  i < items.length - 1 ? "border-b border-dim" : ""
                } hover:bg-surface/50 transition-colors`}
              >
                <span className="font-ui text-sm text-primary truncate">{run.company_name}</span>
                <span className="font-ui text-xs text-muted truncate">{run.industry}</span>
                <span>
                  {run.tier ? (
                    <TierBadge tier={run.tier} />
                  ) : (
                    <span className="font-ui text-[10px] text-ghost">Pending</span>
                  )}
                </span>
                <span className="font-mono text-sm text-primary">
                  {run.score !== null ? run.score : <span className="text-ghost">—</span>}
                </span>
                <span className="font-ui text-xs text-muted">{formatDate(run.created_at)}</span>
              </div>
            ))}
          </div>
        )}
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

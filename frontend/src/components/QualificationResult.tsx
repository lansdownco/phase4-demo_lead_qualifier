"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface QualificationOutput {
  score: number;
  tier: "Hot" | "Warm" | "Cold";
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendedAction: string;
}

interface Props {
  runId: string | null;
  publicToken: string | null;
}

const TERMINAL = new Set([
  "COMPLETED",
  "FAILED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "CANCELED",
  "TIMED_OUT",
  "EXPIRED",
]);

const TIER = {
  Hot: {
    label: "Hot Lead",
    textColor: "text-hot",
    borderColor: "border-hot/30",
    bgColor: "bg-hot/8",
    dotColor: "bg-hot",
    ringColor: "#4ADE80",
    glowColor: "rgba(74,222,128,0.12)",
  },
  Warm: {
    label: "Warm Lead",
    textColor: "text-warm",
    borderColor: "border-warm/30",
    bgColor: "bg-warm/8",
    dotColor: "bg-warm",
    ringColor: "#FB923C",
    glowColor: "rgba(251,146,60,0.12)",
  },
  Cold: {
    label: "Cold Lead",
    textColor: "text-cold",
    borderColor: "border-cold/30",
    bgColor: "bg-cold/8",
    dotColor: "bg-cold",
    ringColor: "#93C5FD",
    glowColor: "rgba(147,197,253,0.12)",
  },
} as const;

/* ── Score Ring ─────────────────────────────────────────── */

function ScoreRing({ score, tier }: { score: number; tier: "Hot" | "Warm" | "Cold" }) {
  const cfg = TIER[tier];
  const radius = 45;
  const circ = 2 * Math.PI * radius;
  const targetOffset = circ - (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ backgroundColor: cfg.glowColor }}
      />
      <svg
        width="144"
        height="144"
        viewBox="0 0 144 144"
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#1E1E26" strokeWidth="1.5" />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={cfg.ringColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          className="animate-ring-draw"
          style={{ "--ring-target": targetOffset } as React.CSSProperties}
        />
      </svg>
      <div className="relative flex flex-col items-center animate-score-reveal">
        <span
          className="font-mono text-[44px] font-normal leading-none tabular-nums"
          style={{ color: cfg.ringColor }}
        >
          {score}
        </span>
        <span className="font-ui text-[9px] font-semibold uppercase tracking-[0.2em] text-muted mt-1">
          / 100
        </span>
      </div>
    </div>
  );
}

/* ── Tier Badge ─────────────────────────────────────────── */

function TierBadge({ tier }: { tier: "Hot" | "Warm" | "Cold" }) {
  const cfg = TIER[tier];
  return (
    <span
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 border text-[10px] font-semibold
        font-ui uppercase tracking-[0.18em]
        ${cfg.textColor} ${cfg.borderColor}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}

/* ── Result Content ─────────────────────────────────────── */

function ResultContent({ output }: { output: QualificationOutput }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-7">
        <ScoreRing score={output.score} tier={output.tier} />
        <div className="space-y-3">
          <TierBadge tier={output.tier} />
          <p className="font-ui text-xs text-muted">Analysis complete</p>
        </div>
      </div>

      <div className="h-px bg-dim" />

      <div className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-muted mb-3">
          Assessment
        </p>
        <p className="font-display text-xl font-light text-primary leading-relaxed italic">
          &ldquo;{output.summary}&rdquo;
        </p>
      </div>

      {output.strengths.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-hot mb-3">
            Strengths
          </p>
          <ul className="space-y-2.5">
            {output.strengths.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm font-ui text-primary animate-fade-in-up"
                style={{ animationDelay: `${0.2 + i * 0.07}s` }}
              >
                <span className="mt-2 w-1 h-1 rounded-full bg-hot flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {output.concerns.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-warm mb-3">
            Concerns
          </p>
          <ul className="space-y-2.5">
            {output.concerns.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm font-ui text-primary animate-fade-in-up"
                style={{ animationDelay: `${0.35 + i * 0.07}s` }}
              >
                <span className="mt-2 w-1 h-1 rounded-full bg-warm flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className="animate-fade-in-up border-l border-accent pl-5 py-0.5"
        style={{ animationDelay: "0.45s" }}
      >
        <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-2">
          Recommended Action
        </p>
        <p className="font-ui text-sm text-primary leading-relaxed">
          {output.recommendedAction}
        </p>
      </div>
    </div>
  );
}

/* ── Empty State ────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative w-14 h-14 mb-7">
        <div className="absolute inset-0 border border-mid rotate-45" />
        <div className="absolute inset-2 border border-dim rotate-[22deg]" />
        <div className="absolute inset-4 border border-ghost rotate-[10deg]" />
      </div>
      <p className="font-display text-2xl font-light text-muted italic mb-2">Awaiting brief</p>
      <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-ghost">
        Complete the form to analyse
      </p>
    </div>
  );
}

/* ── Loading State ──────────────────────────────────────── */

function LoadingState({ status }: { status?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative w-14 h-14 mb-7">
        <div className="absolute inset-0 border border-accent/25 rounded-full spin-slow" />
        <div className="absolute inset-2 border border-accent/45 rounded-full spin-slow-reverse" />
        <div className="absolute inset-4 border border-accent/70 rounded-full spin-fast" />
      </div>
      <p className="font-display text-2xl font-light text-primary italic mb-2">Analysing&hellip;</p>
      {status && (
        <p className="font-mono text-[10px] text-ghost uppercase tracking-widest">
          {status.replace(/_/g, " ")}
        </p>
      )}
    </div>
  );
}

/* ── Error State ────────────────────────────────────────── */

function ErrorState({ message }: { message: string }) {
  return (
    <div className="border border-red-900/40 bg-red-950/20 px-5 py-4">
      <p className="font-ui text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400 mb-1.5">
        Analysis Failed
      </p>
      <p className="font-ui text-xs text-red-500/70">{message}</p>
    </div>
  );
}

/* ── Active Run (has hook) ──────────────────────────────── */

function ActiveRun({ runId, publicToken }: { runId: string; publicToken: string }) {
  const { run, error } = useRealtimeRun(runId, { accessToken: publicToken });
  const savedRef = useRef(false);

  const isTerminal = run?.status != null && TERMINAL.has(run.status);
  const isSuccess = run?.status === "COMPLETED";
  const isError = isTerminal && !isSuccess;

  useEffect(() => {
    if (!isSuccess || !run?.output || savedRef.current) return;
    savedRef.current = true;

    const output = run.output as QualificationOutput;
    const supabase = createClient();
    supabase
      .from("lead_runs")
      .update({ score: output.score, tier: output.tier, summary: output.summary })
      .eq("run_id", runId)
      .then(({ error }) => {
        if (error) console.error("[lead_runs update]", error);
      });
  }, [isSuccess, run?.output, runId]);

  if (error) return <ErrorState message={error.message} />;
  if (isError) return <ErrorState message={`Run ended with status: ${run?.status ?? "unknown"}`} />;
  if (!isTerminal) return <LoadingState status={run?.status} />;
  if (isSuccess && run?.output) return <ResultContent output={run.output as QualificationOutput} />;
  return <LoadingState />;
}

/* ── Root Export ────────────────────────────────────────── */

export default function QualificationResult({ runId, publicToken }: Props) {
  return (
    <div className="border border-dim bg-surface p-7 md:p-9">
      <div className="flex items-center gap-4 mb-8">
        <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
          Analysis
        </span>
        <div className="flex-1 h-px bg-dim" />
      </div>

      {!runId || !publicToken ? (
        <EmptyState />
      ) : (
        <ActiveRun key={runId} runId={runId} publicToken={publicToken} />
      )}
    </div>
  );
}

"use client";

interface Props {
  usedCount: number;
  onUpgrade: () => void;
  isLoading: boolean;
}

export default function UpgradePrompt({ usedCount, onUpgrade, isLoading }: Props) {
  return (
    <div className="border border-dim bg-surface p-7 md:p-9">
      <div className="flex items-center gap-4 mb-8">
        <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.22em] text-warm">
          Daily Limit Reached
        </span>
        <div className="flex-1 h-px bg-dim" />
      </div>

      <div className="flex flex-col items-center text-center py-6 space-y-8">
        <div>
          <p className="font-display text-4xl font-light text-primary italic mb-2">
            {usedCount} / 2 used today
          </p>
          <p className="font-ui text-xs text-muted">
            Free accounts are limited to 2 qualifications per day.
          </p>
        </div>

        <div className="w-full h-px bg-dim" />

        <div className="space-y-4 w-full">
          <button
            onClick={onUpgrade}
            disabled={isLoading}
            className="
              w-full relative overflow-hidden
              border border-accent/60 bg-accent/8
              px-6 py-3.5
              font-ui text-[11px] font-bold uppercase tracking-[0.22em] text-accent
              hover:bg-accent/14 hover:border-accent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {isLoading ? "Redirecting…" : "Upgrade to Pro — $29 / month"}
          </button>
          <p className="font-ui text-[10px] text-ghost tracking-[0.12em]">
            Unlimited qualifications · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

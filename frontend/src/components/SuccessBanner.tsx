"use client";

interface Props {
  onDismiss: () => void;
}

export default function SuccessBanner({ onDismiss }: Props) {
  return (
    <div className="border-b border-hot/30 bg-hot/8 px-6 py-3 flex items-center justify-between">
      <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.18em] text-hot">
        You&rsquo;re now on Pro — enjoy unlimited lead qualifications.
      </p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="font-ui text-sm text-hot/60 hover:text-hot transition-colors ml-4 flex-shrink-0"
      >
        ×
      </button>
    </div>
  );
}

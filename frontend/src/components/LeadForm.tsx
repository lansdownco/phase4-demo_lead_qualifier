"use client";

import { useState, type FormEvent } from "react";

interface LeadFormProps {
  onSubmit: (data: Record<string, string>) => void;
  isSubmitting: boolean;
}

const COMPANY_SIZES = ["1–10", "11–50", "51–200", "200+"] as const;
const BUDGET_RANGES = ["Under $10k", "$10k–$50k", "$50k–$100k", "$100k+"] as const;
const TIMELINES = ["Immediately", "1–3 months", "3–6 months", "Just exploring"] as const;

const INITIAL = {
  companyName: "",
  industry: "",
  companySize: COMPANY_SIZES[0],
  annualBudgetRange: BUDGET_RANGES[0],
  primaryPainPoints: "",
  timeline: TIMELINES[0],
  currentSolutions: "",
  decisionMakerInfo: "",
};

function ChevronDown() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path
        d="M1 1l4 4 4-4"
        stroke="#8A8A9A"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <ChevronDown />
      </div>
    </div>
  );
}

export default function LeadForm({ onSubmit, isSubmitting }: LeadFormProps) {
  const [form, setForm] = useState(INITIAL);

  function field(key: keyof typeof INITIAL) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* ── 01 Company ─────────────────────────────────── */}
      <section>
        <div className="section-rule">
          <span className="section-tag">01 · Company</span>
          <div className="flex-1 h-px bg-dim" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
          <div>
            <label className="field-label" htmlFor="companyName">
              Company Name
            </label>
            <input
              id="companyName"
              className="field-input"
              type="text"
              placeholder="Acme Inc."
              value={form.companyName}
              onChange={field("companyName")}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="industry">
              Industry
            </label>
            <input
              id="industry"
              className="field-input"
              type="text"
              placeholder="SaaS, FinTech, Healthcare…"
              value={form.industry}
              onChange={field("industry")}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="companySize">
              Company Size
            </label>
            <SelectWrapper>
              <select
                id="companySize"
                className="field-select"
                value={form.companySize}
                onChange={field("companySize")}
              >
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s} employees
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>

          <div>
            <label className="field-label" htmlFor="annualBudgetRange">
              Annual Budget
            </label>
            <SelectWrapper>
              <select
                id="annualBudgetRange"
                className="field-select"
                value={form.annualBudgetRange}
                onChange={field("annualBudgetRange")}
              >
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>
        </div>
      </section>

      {/* ── 02 Opportunity ─────────────────────────────── */}
      <section>
        <div className="section-rule">
          <span className="section-tag">02 · Opportunity</span>
          <div className="flex-1 h-px bg-dim" />
        </div>

        <div className="space-y-8">
          <div>
            <label className="field-label" htmlFor="primaryPainPoints">
              Primary Pain Points
            </label>
            <textarea
              id="primaryPainPoints"
              className="field-textarea h-20"
              placeholder="Describe the main challenges this prospect faces…"
              value={form.primaryPainPoints}
              onChange={field("primaryPainPoints")}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="currentSolutions">
              Current Solutions
            </label>
            <input
              id="currentSolutions"
              className="field-input"
              type="text"
              placeholder="Excel, HubSpot free tier, legacy CRM…"
              value={form.currentSolutions}
              onChange={field("currentSolutions")}
              required
            />
          </div>

          <div className="sm:max-w-xs">
            <label className="field-label" htmlFor="timeline">
              Purchase Timeline
            </label>
            <SelectWrapper>
              <select
                id="timeline"
                className="field-select"
                value={form.timeline}
                onChange={field("timeline")}
              >
                {TIMELINES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>
        </div>
      </section>

      {/* ── 03 Decision Maker ──────────────────────────── */}
      <section>
        <div className="section-rule">
          <span className="section-tag">03 · Decision Maker</span>
          <div className="flex-1 h-px bg-dim" />
        </div>

        <div>
          <label className="field-label" htmlFor="decisionMakerInfo">
            Decision Maker Info
          </label>
          <textarea
            id="decisionMakerInfo"
            className="field-textarea h-16"
            placeholder="CEO, confirmed final decision authority, budget holder…"
            value={form.decisionMakerInfo}
            onChange={field("decisionMakerInfo")}
            required
          />
        </div>
      </section>

      {/* ── Submit ─────────────────────────────────────── */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            group relative w-full h-12 overflow-hidden
            border border-accent/30 bg-accent/5
            hover:border-accent hover:bg-accent/10
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200
            flex items-center justify-center gap-3
          "
        >
          {/* Sweep shimmer on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          {isSubmitting ? (
            <>
              <span className="relative flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-accent animate-bounce"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </span>
              <span className="relative font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                Analysing
              </span>
            </>
          ) : (
            <span className="relative font-ui text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Analyse Lead
            </span>
          )}
        </button>
      </div>
    </form>
  );
}

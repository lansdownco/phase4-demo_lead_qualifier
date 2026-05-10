# Project: Phase 4 — AI Lead Qualifier

## Overview

A lead qualification tool. The user fills out a form about a lead, clicks **Analyse**, a Trigger.dev background task runs DeepSeek AI to score and qualify the lead, and the result streams back to the frontend in real time.

---

## WAT Framework

| Layer | Role | Location |
|---|---|---|
| **W** — Workflows / Instructions | Prompt templates, qualification criteria, scoring rubric | `workflows/` |
| **A** — Agent | Claude Code (you) | — |
| **T** — Tools / Scripts | Utility scripts for testing, env validation, deployment helpers | `tools/` |

---

## Architecture

```
Frontend (Next.js → Vercel)
     │
     │ 1. POST /api/qualify  (lead form data)
     ▼
Next.js API Route
     │ 2. auth.createPublicToken() + leadQualifier.trigger(payload)
     │    returns { runId, publicToken }
     ▼
Trigger.dev (backend task)
     │ 3. Validate payload → DeepSeek → score + summary
     ▼
Frontend (useRealtimeRun)
     │ 4. Subscribe to runId with publicToken → stream status + output
     ▼
Result displayed on page
```

**Monorepo structure:**

```
phase4-demo_lead_qualifier/
├── CLAUDE.md
├── workflows/                    # W: prompts & qualification specs
│   ├── lead-qualifier-prompt.md  # DeepSeek system + user prompt templates
│   └── scoring-rubric.md         # Scoring criteria (0–100, tiers)
├── tools/                        # T: utility scripts
│   ├── test-trigger.ts           # Fire a test payload at the Trigger.dev task
│   └── validate-env.ts           # Check all required env vars are set
├── backend/                      # Trigger.dev project
│   ├── src/
│   │   └── trigger/
│   │       └── lead-qualifier.ts # Main task
│   ├── trigger.config.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/                     # Next.js app → Vercel
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx          # Lead form + result display
    │   │   └── api/
    │   │       └── qualify/
    │   │           └── route.ts  # API route: trigger task + return token
    │   └── components/
    │       ├── LeadForm.tsx      # Form with all 8 lead fields
    │       └── QualificationResult.tsx  # Realtime result display
    ├── package.json
    └── tsconfig.json
```

---

## Lead Qualifier Workflow

### Input Fields (form → payload)

| Field | Type | Notes |
|---|---|---|
| `companyName` | string | Required |
| `industry` | string | Required |
| `companySize` | string | e.g. "1–10", "11–50", "51–200", "200+" |
| `annualBudgetRange` | string | e.g. "$10k–$50k", "$50k–$100k", "$100k+" |
| `primaryPainPoints` | string | Free text |
| `timeline` | string | e.g. "Immediately", "1–3 months", "3–6 months", "Just exploring" |
| `currentSolutions` | string | What they use today |
| `decisionMakerInfo` | string | Role, authority level |

### Trigger.dev Task Flow

```
1. Receive & validate payload (all 8 fields required)
2. Build DeepSeek prompt from workflows/lead-qualifier-prompt.md template
3. Call DeepSeek API → get qualification score (0–100) + summary
4. Return structured result:
   {
     score: number,
     tier: "Hot" | "Warm" | "Cold",
     summary: string,
     strengths: string[],
     concerns: string[],
     recommendedAction: string
   }
```

### Qualification Tiers

| Score | Tier | Color |
|---|---|---|
| 75–100 | Hot | Green |
| 40–74 | Warm | Yellow |
| 0–39 | Cold | Red |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Task runner | Trigger.dev v3 (`@trigger.dev/sdk`) |
| LLM | DeepSeek (`deepseek-chat` via `openai` SDK pointed at `https://api.deepseek.com/v1`) |
| Frontend | Next.js 14+ (App Router, TypeScript) |
| Realtime | `@trigger.dev/react-hooks` — `useRealtimeRun` |
| Deployment — backend | Trigger.dev cloud |
| Deployment — frontend | Vercel (connected to GitHub) |
| Runtime | Node.js / TypeScript strict mode |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Purpose |
|---|---|
| `TRIGGER_API_KEY` | Trigger.dev secret API key |
| `DEEPSEEK_API_KEY` | DeepSeek LLM API key |

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|---|---|
| `TRIGGER_SECRET_KEY` | Trigger.dev secret key (server-side, for creating public tokens) |
| `NEXT_PUBLIC_TRIGGER_PROJECT_REF` | Trigger.dev project ref (client-side) |

> Trigger.dev project ID: `proj_gwuusnkyphlcwsgbklon` (shared with Phase 3)

---

## Key Files

| File | Purpose |
|---|---|
| `backend/src/trigger/lead-qualifier.ts` | Main Trigger.dev task |
| `backend/trigger.config.ts` | Trigger.dev project config |
| `frontend/src/app/page.tsx` | Lead form + result display (single page) |
| `frontend/src/app/api/qualify/route.ts` | POST handler: triggers task, returns runId + publicToken |
| `frontend/src/components/LeadForm.tsx` | Controlled form for all 8 lead fields |
| `frontend/src/components/QualificationResult.tsx` | Renders score, tier, summary with realtime updates |
| `workflows/lead-qualifier-prompt.md` | DeepSeek prompt template |
| `workflows/scoring-rubric.md` | Qualification scoring criteria |
| `tools/test-trigger.ts` | Fire a test payload at the task |

---

## Deployment

### Backend (Trigger.dev)

```bash
cd backend
npx trigger dev      # local dev
npx trigger deploy   # deploy to cloud
```

> CLI binary: `trigger` (not `trigger.dev`). Check `node_modules/.bin/trigger`.

### Frontend (Vercel)

- Push to GitHub → Vercel auto-deploys from `frontend/` directory
- Set root directory to `frontend` in Vercel project settings
- Add all `frontend/.env.local` vars to Vercel environment settings

---

## Working Rules for Claude

- **Verify before assuming:** Before writing any script, config, or code referencing a binary or file path — confirm it exists first. Never guess a binary name from the package name alone.
- **DeepSeek pattern:** Use `openai` npm package with `baseURL: "https://api.deepseek.com/v1"` and model `deepseek-chat`. Same pattern as Phase 3.
- **Trigger.dev SDK:** Always use `@trigger.dev/sdk` v3. Never use `client.defineJob` (v2 deprecated).
- **Realtime result display:** Frontend gets `{ runId, publicToken }` from the API route, then uses `useRealtimeRun(runId, { accessToken: publicToken })` to display live status.
- **No features beyond scope:** Build only what is described here. No extra fields, no extra endpoints, no dashboards.
- **TypeScript strict mode** throughout both `backend/` and `frontend/`.
- **WAT discipline:** Prompt templates live in `workflows/`. Utility scripts live in `tools/`. No prompt strings hardcoded in the task file — import or read from `workflows/`.

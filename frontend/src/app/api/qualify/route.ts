import { NextRequest, NextResponse } from "next/server";
import { auth, tasks } from "@trigger.dev/sdk/v3";
import { createClient } from "@/lib/supabase/server";

interface LeadPayload {
  companyName: string;
  industry: string;
  companySize: string;
  annualBudgetRange: string;
  primaryPainPoints: string;
  timeline: string;
  currentSolutions: string;
  decisionMakerInfo: string;
}

const REQUIRED: Array<keyof LeadPayload> = [
  "companyName",
  "industry",
  "companySize",
  "annualBudgetRange",
  "primaryPainPoints",
  "timeline",
  "currentSolutions",
  "decisionMakerInfo",
];

function validate(body: unknown): body is LeadPayload {
  if (!body || typeof body !== "object") return false;
  return REQUIRED.every(
    (k) =>
      typeof (body as Record<string, unknown>)[k] === "string" &&
      ((body as Record<string, unknown>)[k] as string).trim().length > 0,
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    const body: unknown = await req.json();

    if (!validate(body)) {
      return NextResponse.json(
        { error: "All 8 lead fields are required." },
        { status: 400 },
      );
    }

    const run = await tasks.trigger("lead-qualifier", body);

    const publicToken = await auth.createPublicToken({
      scopes: { read: { runs: [run.id] } },
    });

    const { error: insertError } = await supabase.from("lead_runs").insert({
      user_id: user.id,
      run_id: run.id,
      company_name: body.companyName,
      industry: body.industry,
    });
    if (insertError) console.error("[lead_runs insert]", insertError);

    return NextResponse.json({ runId: run.id, publicToken });
  } catch (err) {
    console.error("[/api/qualify]", err);
    return NextResponse.json(
      { error: "Failed to trigger lead qualification." },
      { status: 500 },
    );
  }
}

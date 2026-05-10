// Prompt templates — source of truth is workflows/lead-qualifier-prompt.md

export interface LeadPayload {
  companyName: string;
  industry: string;
  companySize: string;
  annualBudgetRange: string;
  primaryPainPoints: string;
  timeline: string;
  currentSolutions: string;
  decisionMakerInfo: string;
}

export const SYSTEM_PROMPT = `You are an expert B2B sales consultant and lead qualifier. Your job is to evaluate a potential sales lead and determine their quality as a prospect.

Analyze the lead information provided and return a JSON object with this exact structure:
{
  "score": <number 0-100>,
  "tier": <"Hot" | "Warm" | "Cold">,
  "summary": <2-3 sentence overview of this lead's quality and fit>,
  "strengths": [<array of 2-4 positive qualification signals>],
  "concerns": [<array of 1-3 risk factors or weaknesses — can be empty>],
  "recommendedAction": <one clear, specific next step for the sales team>
}

Scoring guide:
- 75-100 (Hot): Strong budget, decision-maker access, clear urgent pain point, short timeline
- 40-74 (Warm): Some qualification signals, needs nurturing, potential fit with follow-up
- 0-39 (Cold): Weak budget, no decision-maker, unclear need, or no urgency

Return ONLY the JSON object. No extra text, no markdown fences.`;

export function buildUserPrompt(lead: LeadPayload): string {
  return `Qualify this sales lead:

Company Name: ${lead.companyName}
Industry: ${lead.industry}
Company Size: ${lead.companySize}
Annual Budget Range: ${lead.annualBudgetRange}
Primary Pain Points: ${lead.primaryPainPoints}
Timeline / Urgency: ${lead.timeline}
Current Solutions in Use: ${lead.currentSolutions}
Decision Maker Info: ${lead.decisionMakerInfo}`;
}

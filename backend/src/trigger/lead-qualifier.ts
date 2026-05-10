import { schemaTask, logger } from "@trigger.dev/sdk";
import { z } from "zod";
import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts/lead-qualifier-prompt.js";

const LeadSchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  companySize: z.string().min(1),
  annualBudgetRange: z.string().min(1),
  primaryPainPoints: z.string().min(1),
  timeline: z.string().min(1),
  currentSolutions: z.string().min(1),
  decisionMakerInfo: z.string().min(1),
});

const QualificationResultSchema = z.object({
  score: z.number().min(0).max(100),
  tier: z.enum(["Hot", "Warm", "Cold"]),
  summary: z.string(),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  recommendedAction: z.string(),
});

export const leadQualifier = schemaTask({
  id: "lead-qualifier",
  schema: LeadSchema,
  run: async (payload) => {
    const deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1",
    });

    logger.info("Lead qualifier started", { companyName: payload.companyName });

    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(payload) },
      ],
      response_format: { type: "json_object" },
    });

    logger.info("DeepSeek response received", { usage: response.usage });

    const raw = response.choices[0].message.content;
    if (!raw) throw new Error("Empty response from DeepSeek");

    const parsed = QualificationResultSchema.parse(JSON.parse(raw));

    // Enforce tier from score regardless of what the model returned
    const tier: "Hot" | "Warm" | "Cold" =
      parsed.score >= 75 ? "Hot" : parsed.score >= 40 ? "Warm" : "Cold";

    const result = { ...parsed, tier };

    logger.info("Lead qualified", { score: result.score, tier: result.tier });

    return result;
  },
});

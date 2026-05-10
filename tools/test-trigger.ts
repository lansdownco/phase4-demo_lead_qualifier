// Run: cd backend && npx tsx ../tools/test-trigger.ts
// Requires TRIGGER_API_KEY in backend/.env (loaded automatically by Trigger.dev CLI)
import { tasks } from "@trigger.dev/sdk";

const testPayload = {
  companyName: "Acme Corp",
  industry: "SaaS / Technology",
  companySize: "11–50",
  annualBudgetRange: "$10k–$50k",
  primaryPainPoints: "Manual lead qualification is too slow and inconsistent",
  timeline: "1–3 months",
  currentSolutions: "Spreadsheets and HubSpot free tier",
  decisionMakerInfo: "CEO — final decision maker",
};

async function main() {
  console.log("Triggering lead-qualifier task...");
  const handle = await tasks.trigger("lead-qualifier", testPayload);
  console.log("Run ID:", handle.id);
  console.log("View at: https://app.trigger.dev/runs/" + handle.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

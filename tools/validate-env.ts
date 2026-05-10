// Run: npx tsx tools/validate-env.ts
// Checks that all required env vars are present before deploying

const BACKEND_VARS = ["TRIGGER_API_KEY", "DEEPSEEK_API_KEY"];

function check(vars: string[], label: string) {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`[${label}] Missing: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log(`[${label}] OK — all env vars present`);
}

check(BACKEND_VARS, "backend");

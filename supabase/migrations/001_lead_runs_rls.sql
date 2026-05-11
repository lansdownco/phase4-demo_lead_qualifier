-- Migration: Enable Row Level Security on lead_runs
-- Applied manually via Supabase dashboard.
-- Re-run this in any new Supabase project to reproduce the same state.

ALTER TABLE lead_runs ENABLE ROW LEVEL SECURITY;

-- Single ALL policy: users can only read/write their own rows
CREATE POLICY "Users see own runs"
  ON lead_runs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

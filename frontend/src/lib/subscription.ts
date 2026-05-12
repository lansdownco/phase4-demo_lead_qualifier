import { createServiceClient } from "@/lib/supabase/service";

export interface UserSubscription {
  status: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

export async function getUserSubscription(
  userId: string,
): Promise<UserSubscription | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, stripe_customer_id")
    .eq("user_id", userId)
    .single();
  return data ?? null;
}

export async function getTodayUsageCount(userId: string): Promise<number> {
  const supabase = createServiceClient();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("lead_runs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", todayStart.toISOString());

  return count ?? 0;
}

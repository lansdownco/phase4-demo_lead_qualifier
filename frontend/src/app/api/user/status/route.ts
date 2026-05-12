import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getUserSubscription, getTodayUsageCount } from "@/lib/subscription";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const { data: subRaw, error: subError } = await serviceClient
      .from("subscriptions")
      .select("status, current_period_end, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const [, todayCount] = await Promise.all([
      getUserSubscription(user.id),
      getTodayUsageCount(user.id),
    ]);

    return NextResponse.json({
      subscription: subRaw ? { status: subRaw.status } : null,
      todayCount,
      limit: 2,
      _debug: { userId: user.id, subRaw, subError },
    });
  } catch (err) {
    console.error("[/api/user/status]", err);
    return NextResponse.json({ error: "Failed to fetch status." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    const [subscription, todayCount] = await Promise.all([
      getUserSubscription(user.id),
      getTodayUsageCount(user.id),
    ]);

    return NextResponse.json({
      subscription: subscription ? { status: subscription.status } : null,
      todayCount,
      limit: 2,
    });
  } catch (err) {
    console.error("[/api/user/status]", err);
    return NextResponse.json({ error: "Failed to fetch status." }, { status: 500 });
  }
}

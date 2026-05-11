import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
    }

    const subscription = await getUserSubscription(user.id);
    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No subscription found." },
        { status: 400 },
      );
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[/api/stripe/portal]", err);
    return NextResponse.json(
      { error: "Failed to create portal session." },
      { status: 500 },
    );
  }
}

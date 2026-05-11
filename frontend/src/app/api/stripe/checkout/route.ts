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
    if (subscription?.status === "active") {
      return NextResponse.json(
        { error: "Already subscribed." },
        { status: 400 },
      );
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    let customerId = subscription?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${origin}/?upgraded=true`,
      cancel_url: `${origin}/`,
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[/api/stripe/checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("[stripe webhook] Invalid signature", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const supabaseUserId = session.metadata?.supabase_user_id;
        if (!supabaseUserId || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        // current_period_end is a Unix timestamp that exists at runtime
        const subAny = sub as unknown as { current_period_end: number };

        await supabase.from("subscriptions").upsert(
          {
            user_id: supabaseUserId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: sub.id,
            status: sub.status,
            current_period_end: new Date(
              subAny.current_period_end * 1000,
            ).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const subAny = sub as unknown as { current_period_end: number };
        await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            current_period_end: new Date(
              subAny.current_period_end * 1000,
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook] Handler error", err);
    return NextResponse.json({ error: "Handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

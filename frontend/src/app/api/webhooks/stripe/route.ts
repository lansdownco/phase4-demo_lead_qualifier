import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";
import Stripe from "stripe";

function getPeriodEnd(sub: unknown): string | null {
  const s = sub as Record<string, unknown>;
  // current_period_end moved in newer API versions
  const raw =
    (s["current_period_end"] as number | undefined) ??
    ((s["billing_cycle_anchor"] as number | undefined));
  return raw ? new Date(raw * 1000).toISOString() : null;
}

function getSubscriptionId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "id" in value) {
    return (value as { id: string }).id;
  }
  return null;
}

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
        const subscriptionId = getSubscriptionId(session.subscription);
        if (!supabaseUserId || !subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        const { error: upsertError } = await supabase
          .from("subscriptions")
          .upsert(
            {
              user_id: supabaseUserId,
              stripe_customer_id:
                typeof session.customer === "string"
                  ? session.customer
                  : (session.customer as { id: string } | null)?.id ?? null,
              stripe_subscription_id: sub.id,
              status: sub.status,
              current_period_end: getPeriodEnd(sub),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );

        if (upsertError) {
          console.error("[stripe webhook] Upsert error", upsertError);
          return NextResponse.json({ error: "DB error." }, { status: 500 });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            current_period_end: getPeriodEnd(sub),
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

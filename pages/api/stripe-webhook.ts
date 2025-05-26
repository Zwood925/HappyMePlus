// pages/api/stripe-webhook.ts
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

// Disable Next.js default body parser so we can use raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const rawBody = await buffer(req);
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Connect to Supabase with admin privileges (via service role key)
  const supabase = createServerSupabaseClient({
    req,
    res,
  });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_email;
    const promoUsed = session.metadata?.promoCode || "none";

    console.log("✅ Stripe checkout completed for:", customerEmail);

    if (customerEmail) {
      const { error } = await supabase
        .from("profiles")
        .update({
          stripe_status: promoUsed === "FREE" ? "free" : promoUsed === "ONETIME" ? "paid" : "subscribed",
        })
        .eq("email", customerEmail);

      if (error) {
        console.error("❌ Failed to update stripe_status in Supabase:", error.message);
        return res.status(500).json({ message: "Supabase update failed" });
      }
    }
  }

  res.status(200).json({ received: true });
}

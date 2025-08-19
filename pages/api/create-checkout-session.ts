import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { config } from "../../lib/config";

const stripe = new Stripe(config.stripe.secretKey || "", {
  apiVersion: "2025-04-30.basil",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { promoCode } = req.body;

    // ✅ Strongly typed Stripe discounts array
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];

    if (promoCode && promoCode.toLowerCase() !== "no_promo") {
      const promoSearch = await stripe.promotionCodes.list({
        code: promoCode,
        active: true,
      });

      if (promoSearch.data.length === 0) {
        return res.status(400).json({ error: "Invalid promo code" });
      }

      discounts = [{ promotion_code: promoSearch.data[0].id }];
    }

const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  payment_method_types: ["card"],
  line_items: [
    {
      price: config.stripe.priceId || "",
      quantity: 1,
    },
  ],
  discounts,
  success_url: `${req.headers.origin}/success`,
  cancel_url: `${req.headers.origin}/cancel`,
});

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("❌ Stripe error:", err.message);
    return res.status(500).json({ error: "Something went wrong." });
  }
}

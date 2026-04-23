/**
 * Razorpay server functions — env-keyed (single tenant per deployment).
 *
 * Required runtime env vars (set per-deployment by the store owner):
 *   - RAZORPAY_KEY_ID
 *   - RAZORPAY_KEY_SECRET
 *   - RAZORPAY_WEBHOOK_SECRET
 *
 * The store owner gets these from https://dashboard.razorpay.com → Account & Settings → API Keys.
 * The webhook secret is set when they add the webhook URL: https://{their-domain}/api/public/razorpay-webhook
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const createOrderInput = z.object({
  listing_id: z.string().uuid(),
  buyer_notes: z.string().trim().max(1000).optional(),
});

export interface CreateRazorpayOrderResult {
  orderId: string;            // our internal orders.id
  orderNumber: string;
  razorpayOrderId: string;
  razorpayKeyId: string;       // publishable key id, safe to send to client
  amountInPaise: number;
  currency: "INR";
  listingTitle: string;
  buyerName: string | null;
  buyerEmail: string | null;
}

/**
 * Public-key check — used by the admin "Payments setup" page to confirm
 * the deployment is wired up correctly without exposing the secret.
 */
export const getRazorpayConfigStatus = createServerFn({ method: "GET" }).handler(async () => {
  return {
    keyIdConfigured: Boolean(process.env.RAZORPAY_KEY_ID),
    keySecretConfigured: Boolean(process.env.RAZORPAY_KEY_SECRET),
    webhookSecretConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
    keyIdPrefix: process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")
      ? "test"
      : process.env.RAZORPAY_KEY_ID?.startsWith("rzp_live_")
      ? "live"
      : null,
  };
});

/**
 * Creates an internal order row + a Razorpay order via the REST API,
 * then returns everything the client Razorpay Checkout needs.
 */
export const createRazorpayOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createOrderInput.parse(input))
  .handler(async ({ data, context }): Promise<CreateRazorpayOrderResult> => {
    const { userId, supabase } = context;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay is not configured for this deployment. The store owner must set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
      );
    }

    // 1. Look up the listing (RLS scoped — only active listings visible)
    const { data: listing, error: listingErr } = await supabase
      .from("listings")
      .select("id,title,price_inr,seller_id,status")
      .eq("id", data.listing_id)
      .maybeSingle();

    if (listingErr) throw new Error(listingErr.message);
    if (!listing) throw new Error("Listing not found or no longer available.");
    if (listing.status !== "active") throw new Error("This listing is not available for purchase.");
    if (listing.seller_id === userId) throw new Error("You can't purchase your own listing.");

    // 2. Get buyer profile for prefill
    const { data: buyer } = await supabase
      .from("profiles")
      .select("display_name,phone")
      .eq("id", userId)
      .maybeSingle();
    const { data: claims } = await supabase.auth.getUser();
    const buyerEmail = claims?.user?.email ?? null;

    // 3. Insert internal order row (no commission — money flows direct to seller)
    const { data: orderRow, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        buyer_id: userId,
        seller_id: listing.seller_id,
        listing_id: listing.id,
        listing_title: listing.title,
        amount_inr: listing.price_inr,
        commission_inr: 0,
        seller_payout_inr: listing.price_inr,
        status: "pending_payment",
        payment_status: "created",
        payment_method: "razorpay",
        buyer_notes: data.buyer_notes ?? null,
      })
      .select("id,order_number,amount_inr")
      .single();

    if (orderErr || !orderRow) throw new Error(orderErr?.message ?? "Failed to create order");

    // 4. Create Razorpay order via REST API
    const amountInPaise = orderRow.amount_inr * 100;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderRow.order_number,
        notes: {
          internal_order_id: orderRow.id,
          listing_id: listing.id,
          buyer_id: userId,
          seller_id: listing.seller_id,
        },
      }),
    });

    if (!rzpRes.ok) {
      const errText = await rzpRes.text();
      console.error("Razorpay order create failed:", rzpRes.status, errText);
      // Mark our order as failed so it doesn't dangle
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed", status: "cancelled" })
        .eq("id", orderRow.id);
      throw new Error(`Could not create Razorpay order (${rzpRes.status}). Check the store owner's API keys.`);
    }

    const rzpOrder = (await rzpRes.json()) as { id: string; amount: number; currency: string };

    // 5. Save razorpay_order_id back so the webhook can find us
    await supabaseAdmin
      .from("orders")
      .update({ razorpay_order_id: rzpOrder.id })
      .eq("id", orderRow.id);

    return {
      orderId: orderRow.id,
      orderNumber: orderRow.order_number,
      razorpayOrderId: rzpOrder.id,
      razorpayKeyId: keyId, // publishable, safe
      amountInPaise,
      currency: "INR",
      listingTitle: listing.title,
      buyerName: buyer?.display_name ?? null,
      buyerEmail,
    };
  });

/**
 * Client-side success callback — verifies the payment signature and flips
 * the order to paid. The webhook is the source of truth, but this gives
 * the user instant feedback after the modal closes.
 */
const verifyInput = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => verifyInput.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new Error("Razorpay is not configured.");

    const { createHmac, timingSafeEqual } = await import("crypto");
    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(data.razorpay_signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error("Payment signature verification failed.");
    }

    // Find the order
    const { data: orderRow } = await supabaseAdmin
      .from("orders")
      .select("id,buyer_id,status,payment_status")
      .eq("razorpay_order_id", data.razorpay_order_id)
      .maybeSingle();

    if (!orderRow) throw new Error("Order not found for this payment.");
    if (orderRow.buyer_id !== userId) throw new Error("This order does not belong to you.");

    // Idempotent — webhook may already have updated it
    if (orderRow.payment_status !== "paid") {
      await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          payment_status: "paid",
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
        })
        .eq("id", orderRow.id);
    }

    return { orderId: orderRow.id };
  });
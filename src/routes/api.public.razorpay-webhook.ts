/**
 * Razorpay webhook receiver.
 *
 * Store-owner setup (one-time, in the Razorpay dashboard):
 *   1. Settings → Webhooks → Add New Webhook
 *   2. URL:    https://{your-domain}/api/public/razorpay-webhook
 *   3. Secret: any strong random string — paste the SAME value as RAZORPAY_WEBHOOK_SECRET in deployment env
 *   4. Events: payment.captured, payment.failed, order.paid
 *
 * Security:
 *   - HMAC SHA256 signature verified with timing-safe compare.
 *   - Idempotent — `payment_events.event_id` has a unique index; replays no-op.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
          console.error("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET not set");
          return new Response("Webhook not configured", { status: 503 });
        }

        const signature = request.headers.get("x-razorpay-signature");
        const body = await request.text();

        if (!signature) return new Response("Missing signature", { status: 401 });

        // Verify HMAC
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expected);
        if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
          console.warn("[razorpay-webhook] invalid signature");
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: any;
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const eventType: string = payload.event ?? "unknown";
        const eventId: string =
          payload.id ??
          request.headers.get("x-razorpay-event-id") ??
          `${eventType}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const paymentEntity = payload.payload?.payment?.entity;
        const orderEntity = payload.payload?.order?.entity;
        const razorpayOrderId: string | null =
          paymentEntity?.order_id ?? orderEntity?.id ?? null;
        const razorpayPaymentId: string | null = paymentEntity?.id ?? null;

        // Find our internal order
        let internalOrderId: string | null = null;
        if (razorpayOrderId) {
          const { data: orderRow } = await supabaseAdmin
            .from("orders")
            .select("id,payment_status,status")
            .eq("razorpay_order_id", razorpayOrderId)
            .maybeSingle();
          internalOrderId = orderRow?.id ?? null;
        }

        // Log the event (idempotent via unique event_id)
        const { error: logErr } = await supabaseAdmin
          .from("payment_events")
          .insert({
            provider: "razorpay",
            event_id: eventId,
            event_type: eventType,
            order_id: internalOrderId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            payload: payload as never,
            signature_verified: true,
            processed: false,
          });

        if (logErr) {
          // Duplicate event — already processed, return 200 so Razorpay stops retrying
          if (logErr.code === "23505") return new Response("Duplicate event", { status: 200 });
          console.error("[razorpay-webhook] insert event failed:", logErr);
          return new Response("Server error", { status: 500 });
        }

        // Process the event
        try {
          if (eventType === "payment.captured" || eventType === "order.paid") {
            if (internalOrderId) {
              await supabaseAdmin
                .from("orders")
                .update({
                  status: "paid",
                  payment_status: "paid",
                  razorpay_payment_id: razorpayPaymentId,
                })
                .eq("id", internalOrderId)
                .neq("payment_status", "paid");
            }
          } else if (eventType === "payment.failed") {
            if (internalOrderId) {
              await supabaseAdmin
                .from("orders")
                .update({ payment_status: "failed", status: "cancelled" })
                .eq("id", internalOrderId)
                .eq("payment_status", "created");
            }
          }

          await supabaseAdmin
            .from("payment_events")
            .update({ processed: true })
            .eq("event_id", eventId);
        } catch (err) {
          console.error("[razorpay-webhook] processing error:", err);
          await supabaseAdmin
            .from("payment_events")
            .update({ processing_error: err instanceof Error ? err.message : String(err) })
            .eq("event_id", eventId);
          // Still return 200 — we've logged it; don't make Razorpay retry forever
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
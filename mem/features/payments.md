---
name: Payment architecture
description: Razorpay integration model — single tenant per deployment, env-keyed, no platform commission
type: feature
---
Per-deployment Razorpay account. The store owner (whoever deploys the template) sets RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET as runtime secrets. All buyer payments flow into THAT account.

No platform commission. orders.commission_inr stays in schema for informational use but defaults to 0 and seller_payout_inr = amount_inr.

Flow: createRazorpayOrder server fn (auth-required) → creates orders row + Razorpay order via REST API → returns key_id + razorpay_order_id to client → Razorpay Checkout opens → webhook /api/public/razorpay-webhook verifies HMAC SHA256 signature → flips orders.payment_status='paid' + orders.status='paid'. Idempotent via payment_events.event_id.

Webhook endpoint MUST be configured by the store owner in their Razorpay dashboard pointing at https://{their-domain}/api/public/razorpay-webhook with the same RAZORPAY_WEBHOOK_SECRET.

seller_subscriptions table exists for future per-seller tier feature flags (Free/Basic/Pro/Advanced) but is NOT a paid SaaS in this template — store owner toggles tiers manually from admin.
DROP FUNCTION IF EXISTS public.ensure_seller_subscription() CASCADE;

ALTER TABLE public.seller_plans ALTER COLUMN commission_pct SET DEFAULT 0;
UPDATE public.seller_plans SET commission_pct = 0 WHERE commission_pct <> 0;

ALTER TABLE public.orders ALTER COLUMN commission_inr SET DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS seller_subscriptions_seller_id_unique
  ON public.seller_subscriptions(seller_id);

CREATE INDEX IF NOT EXISTS orders_razorpay_order_id_idx ON public.orders(razorpay_order_id);
CREATE UNIQUE INDEX IF NOT EXISTS payment_events_event_id_unique ON public.payment_events(event_id);
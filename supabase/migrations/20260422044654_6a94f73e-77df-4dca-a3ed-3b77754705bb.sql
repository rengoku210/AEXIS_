
-- =========================================================================
-- PHASE 2: MONETIZATION + SELLER OPS
-- =========================================================================

-- 1. ENUMS ----------------------------------------------------------------
CREATE TYPE public.plan_tier AS ENUM ('free', 'basic', 'pro', 'advanced');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'expired');
CREATE TYPE public.kyc_status AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');
CREATE TYPE public.payout_method_type AS ENUM ('upi', 'bank');
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'on_hold');
CREATE TYPE public.boost_type AS ENUM ('featured', 'spotlight');
CREATE TYPE public.payment_status AS ENUM ('created', 'attempted', 'paid', 'failed', 'refunded');
CREATE TYPE public.settlement_status AS ENUM ('pending', 'eligible', 'settled', 'on_hold');

-- 2. SELLER PLANS ----------------------------------------------------------
CREATE TABLE public.seller_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier public.plan_tier NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  price_inr_monthly INTEGER NOT NULL DEFAULT 0,
  price_inr_yearly INTEGER NOT NULL DEFAULT 0,
  listing_limit INTEGER NOT NULL DEFAULT 3,
  featured_slots INTEGER NOT NULL DEFAULT 0,
  includes_verified_badge BOOLEAN NOT NULL DEFAULT false,
  includes_spotlight BOOLEAN NOT NULL DEFAULT false,
  commission_pct NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY plans_public_read ON public.seller_plans
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY plans_admin_all ON public.seller_plans
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_seller_plans_updated
  BEFORE UPDATE ON public.seller_plans
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed plans with placeholder pricing (editable in admin)
INSERT INTO public.seller_plans (tier, name, tagline, price_inr_monthly, price_inr_yearly, listing_limit, featured_slots, includes_verified_badge, includes_spotlight, commission_pct, sort_order, features) VALUES
  ('free',     'Free',     'Get started selling on Aexis',         0,     0,      3,   0, false, false, 10.00, 1, '["Up to 3 active listings","Standard support","10% commission"]'::jsonb),
  ('basic',    'Basic',    'For active sellers',                    0,     0,     10,   1, false, false, 10.00, 2, '["Up to 10 active listings","1 featured slot","Priority support"]'::jsonb),
  ('pro',      'Pro',      'Verified seller with premium presence', 0,     0,     30,   3, true,  false,  8.00, 3, '["Up to 30 active listings","3 featured slots","Verified badge","Lower 8% commission"]'::jsonb),
  ('advanced', 'Advanced', 'Unlimited reach + spotlight placement', 0,     0, 999999, 10, true,  true,   6.00, 4, '["Unlimited listings","10 featured slots","Verified badge","Spotlight placement","Lowest 6% commission","Dedicated support"]'::jsonb);

-- 3. SELLER SUBSCRIPTIONS --------------------------------------------------
CREATE TABLE public.seller_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE,
  plan_id UUID NOT NULL REFERENCES public.seller_plans(id),
  status public.subscription_status NOT NULL DEFAULT 'active',
  billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly','yearly')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  razorpay_subscription_id TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subs_self_read ON public.seller_subscriptions
  FOR SELECT USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY subs_admin_all ON public.seller_subscriptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_subs_updated
  BEFORE UPDATE ON public.seller_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4. SELLER KYC ------------------------------------------------------------
CREATE TABLE public.seller_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE,
  legal_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_type TEXT NOT NULL CHECK (id_type IN ('aadhaar','pan','passport','driving_license','voter_id')),
  id_number TEXT NOT NULL,
  id_document_url TEXT,
  address_line TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  status public.kyc_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_kyc ENABLE ROW LEVEL SECURITY;

CREATE POLICY kyc_self_read ON public.seller_kyc
  FOR SELECT USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY kyc_self_insert ON public.seller_kyc
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY kyc_self_update ON public.seller_kyc
  FOR UPDATE USING (auth.uid() = seller_id AND status IN ('pending','rejected'));

CREATE POLICY kyc_admin_all ON public.seller_kyc
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_kyc_updated
  BEFORE UPDATE ON public.seller_kyc
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 5. PAYOUT METHODS --------------------------------------------------------
CREATE TABLE public.payout_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  method_type public.payout_method_type NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT true,
  upi_id TEXT,
  bank_account_holder TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_name TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT payout_method_data_check CHECK (
    (method_type = 'upi' AND upi_id IS NOT NULL) OR
    (method_type = 'bank' AND bank_account_number IS NOT NULL AND bank_ifsc IS NOT NULL)
  )
);

CREATE INDEX idx_payout_methods_seller ON public.payout_methods(seller_id);

ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY payout_self_read ON public.payout_methods
  FOR SELECT USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY payout_self_write ON public.payout_methods
  FOR ALL USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

CREATE POLICY payout_admin_all ON public.payout_methods
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_payout_methods_updated
  BEFORE UPDATE ON public.payout_methods
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 6. SELLER PAYOUTS (settlements) -----------------------------------------
CREATE TABLE public.seller_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_number TEXT NOT NULL UNIQUE DEFAULT ('PAY-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  seller_id UUID NOT NULL,
  payout_method_id UUID REFERENCES public.payout_methods(id),
  amount_inr INTEGER NOT NULL,
  order_count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  status public.payout_status NOT NULL DEFAULT 'pending',
  reference TEXT,
  notes TEXT,
  initiated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payouts_seller ON public.seller_payouts(seller_id);
CREATE INDEX idx_payouts_status ON public.seller_payouts(status);

ALTER TABLE public.seller_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY payouts_self_read ON public.seller_payouts
  FOR SELECT USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY payouts_admin_all ON public.seller_payouts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_payouts_updated
  BEFORE UPDATE ON public.seller_payouts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 7. LISTING BOOSTS --------------------------------------------------------
CREATE TABLE public.listing_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  boost_type public.boost_type NOT NULL,
  amount_inr INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  razorpay_payment_id TEXT,
  status public.payment_status NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_boosts_listing ON public.listing_boosts(listing_id);
CREATE INDEX idx_boosts_seller ON public.listing_boosts(seller_id);

ALTER TABLE public.listing_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY boosts_self_read ON public.listing_boosts
  FOR SELECT USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY boosts_seller_create ON public.listing_boosts
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY boosts_admin_all ON public.listing_boosts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 8. PAYMENT EVENTS (webhook audit) ----------------------------------------
CREATE TABLE public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'razorpay',
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  order_id UUID,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  payload JSONB NOT NULL,
  signature_verified BOOLEAN NOT NULL DEFAULT false,
  processed BOOLEAN NOT NULL DEFAULT false,
  processing_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);

CREATE INDEX idx_pe_order ON public.payment_events(order_id);
CREATE INDEX idx_pe_rzp_order ON public.payment_events(razorpay_order_id);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY pe_admin_only ON public.payment_events
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- 9. EXTEND ORDERS ---------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN razorpay_order_id TEXT,
  ADD COLUMN razorpay_payment_id TEXT,
  ADD COLUMN razorpay_signature TEXT,
  ADD COLUMN payment_status public.payment_status NOT NULL DEFAULT 'created',
  ADD COLUMN settlement_status public.settlement_status NOT NULL DEFAULT 'pending',
  ADD COLUMN settled_at TIMESTAMPTZ,
  ADD COLUMN payout_id UUID REFERENCES public.seller_payouts(id);

CREATE INDEX idx_orders_rzp_order ON public.orders(razorpay_order_id);
CREATE INDEX idx_orders_settlement ON public.orders(settlement_status);

-- 10. EXTEND LISTINGS ------------------------------------------------------
ALTER TABLE public.listings
  ADD COLUMN is_spotlighted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN featured_until TIMESTAMPTZ,
  ADD COLUMN spotlight_until TIMESTAMPTZ;

-- 11. AUTO-CREATE FREE SUBSCRIPTION ON SELLER ROLE -------------------------
CREATE OR REPLACE FUNCTION public.ensure_seller_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_id UUID;
BEGIN
  IF NEW.role = 'seller' THEN
    SELECT id INTO v_plan_id FROM public.seller_plans WHERE tier = 'free' LIMIT 1;
    INSERT INTO public.seller_subscriptions (seller_id, plan_id, status)
    VALUES (NEW.user_id, v_plan_id, 'active')
    ON CONFLICT (seller_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ensure_seller_sub
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_seller_subscription();

-- Backfill subscriptions for existing sellers
INSERT INTO public.seller_subscriptions (seller_id, plan_id, status)
SELECT ur.user_id, sp.id, 'active'
FROM public.user_roles ur
CROSS JOIN public.seller_plans sp
WHERE ur.role = 'seller' AND sp.tier = 'free'
ON CONFLICT (seller_id) DO NOTHING;

-- 12. STORAGE BUCKETS -----------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES
  ('listing-images', 'listing-images', true),
  ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- listing-images policies (path: {seller_id}/{listing_id}/{filename})
CREATE POLICY "listing_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-images');

CREATE POLICY "listing_images_seller_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND public.has_role(auth.uid(), 'seller')
  );

CREATE POLICY "listing_images_seller_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'listing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "listing_images_seller_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listing-images'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
  );

-- kyc-documents policies (path: {seller_id}/{filename})
CREATE POLICY "kyc_docs_owner_admin_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kyc-documents'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "kyc_docs_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kyc-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "kyc_docs_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'kyc-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

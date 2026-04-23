---
name: Database schema
description: Core tables, enums, and RLS rules for the Aexis marketplace
type: feature
---
Tables: profiles (seller_status enum), user_roles (admin/seller/buyer), categories (4 seeded slugs: game-accounts, coaching, rank-boosting, in-game-credits), listings (status: draft/pending/active/rejected/suspended/expired/sold), orders (status: pending_payment→paid→delivered→completed, with commission_inr + seller_payout_inr).
Trigger: `handle_new_user` auto-creates profile + buyer role on signup.
Helper: `has_role(uid, role)` SECURITY DEFINER — use in all RLS role checks to avoid recursion.
Listings: public sees `status='active'`, sellers see own, admins see all. Sellers can only update own while status in (draft/pending/rejected).
Orders: visible to buyer, seller, or admin. Buyer creates with own buyer_id; seller can update (delivery); admin can update anything.

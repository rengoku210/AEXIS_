# Project Memory

## Core
Whitelabel marketplace template. Each deployment = ONE store owner. Razorpay keys live in process.env (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET). NO platform commission — money flows buyer→seller direct. Lovable sells the template, not payment processing.
Stack: TanStack Start v1 + Lovable Cloud (Supabase). Use createServerFn + /api/public/* routes, never edge functions.
Design: Obsidian VIP — dark luxe (#0A0A0F bg, gold #D4AF37 accents, serif headlines).

## Memories
- [Database schema](mem://features/schema.md) — Tables, enums, RLS rules
- [Payment architecture](mem://features/payments.md) — Razorpay env-keyed, webhook flow, no commission
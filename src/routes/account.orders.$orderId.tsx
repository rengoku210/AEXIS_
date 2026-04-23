import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/hooks/use-auth";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/server/razorpay.functions";
import { openRazorpayCheckout } from "@/lib/razorpay-client";

export const Route = createFileRoute("/account/orders/$orderId")({
  component: OrderDetail,
});

interface Order {
  id: string; order_number: string; listing_title: string; listing_id: string;
  amount_inr: number; commission_inr: number; seller_payout_inr: number;
  status: string; payment_status: string;
  payment_method: string | null; payment_ref: string | null;
  razorpay_order_id: string | null; razorpay_payment_id: string | null;
  buyer_notes: string | null; created_at: string;
}

function OrderDetail() {
  const { orderId } = Route.useParams();
  const { user } = useAuth();
  const createOrderFn = useServerFn(createRazorpayOrder);
  const verifyFn = useServerFn(verifyRazorpayPayment);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    setOrder(data as Order | null);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [orderId]);

  const payNow = async () => {
    if (!order || !user) return;
    setPaying(true);
    try {
      // Re-create a fresh Razorpay order against the same listing — keeps things
      // simple if the user abandoned the previous attempt.
      const fresh = await createOrderFn({
        data: { listing_id: order.listing_id, buyer_notes: order.buyer_notes ?? undefined },
      });
      await openRazorpayCheckout({
        key: fresh.razorpayKeyId,
        amount: fresh.amountInPaise,
        currency: fresh.currency,
        name: "Aexis",
        description: fresh.listingTitle,
        order_id: fresh.razorpayOrderId,
        prefill: {
          name: fresh.buyerName ?? undefined,
          email: fresh.buyerEmail ?? undefined,
        },
        theme: { color: "#7a0a14" },
        notes: { aexis_order_number: fresh.orderNumber },
        handler: async (resp) => {
          try { await verifyFn({ data: resp }); toast.success("Payment confirmed"); }
          catch { toast.info("Payment received. Confirming…"); }
          void load();
        },
        modal: {
          ondismiss: () => { setPaying(false); toast.info("Payment cancelled"); },
          confirm_close: true,
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start payment");
      setPaying(false);
    }
  };

  const confirmReceived = async () => {
    const { error } = await supabase.from("orders").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", orderId);
    if (error) { toast.error(error.message); return; }
    toast.success("Order completed");
    void load();
  };

  if (loading) return <SiteShell><div className="px-6 py-32 text-center text-muted-foreground">Loading…</div></SiteShell>;
  if (!order) return <SiteShell><div className="px-6 py-32 text-center"><h1 className="text-3xl font-bold">Order not found</h1><Link to="/account" className="text-crimson mt-4 inline-block">Back to account</Link></div></SiteShell>;

  return (
    <SiteShell>
      <div className="px-6 pt-12 pb-24 max-w-3xl mx-auto">
        <Link to="/account" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">← Account</Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mt-6 mb-3">— Order {order.order_number}</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{order.listing_title}</h1>

        <div className="mt-8 glass-strong rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Amount</p>
              <p className="text-2xl font-bold">{formatINR(order.amount_inr)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-semibold uppercase tracking-wider">{order.status.replace("_", " ")}</p>
            </div>
          </div>

          {order.buyer_notes && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Your notes</p>
              <p className="text-sm font-light text-muted-foreground">{order.buyer_notes}</p>
            </div>
          )}

          {order.status === "pending_payment" && user?.id && (
            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-crimson" /> Secure payment via Razorpay (UPI, Cards, Net Banking, Wallets).</div>
              <button onClick={payNow} disabled={paying} className="w-full bg-crimson text-foreground py-3.5 rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-crimson-glow disabled:opacity-50 transition-colors">
                {paying ? "Opening Razorpay…" : `Pay ${formatINR(order.amount_inr)}`}
              </button>
              <p className="mt-3 font-mono text-[9px] text-center uppercase tracking-widest text-muted-foreground">100% secure · Powered by Razorpay</p>
            </div>
          )}
          {order.status === "cancelled" && (
            <div className="border-t border-border pt-6 flex items-center gap-2 text-sm text-crimson"><XCircle className="size-4" /> This order was cancelled.</div>
          )}

          {order.status === "paid" && (
            <div className="border-t border-border pt-6 flex items-center gap-2 text-sm"><Clock className="size-4 text-yellow-500" /> Awaiting seller delivery</div>
          )}
          {order.status === "delivered" && (
            <div className="border-t border-border pt-6">
              <p className="text-sm mb-4 flex items-center gap-2"><CheckCircle2 className="size-4 text-green-500" /> Seller marked this as delivered. Confirm to release payment.</p>
              <button onClick={confirmReceived} className="w-full bg-crimson text-foreground py-3.5 rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-crimson-glow transition-colors">
                Confirm receipt & complete order
              </button>
            </div>
          )}
          {order.status === "completed" && (
            <div className="border-t border-border pt-6 flex items-center gap-2 text-sm text-green-500"><CheckCircle2 className="size-4" /> Order completed. Funds released to seller.</div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}

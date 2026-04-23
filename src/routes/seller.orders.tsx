import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatINR, timeAgo } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/seller/orders")({
  component: SellerOrders,
});

interface Order {
  id: string; order_number: string; listing_title: string;
  amount_inr: number; commission_inr: number; seller_payout_inr: number;
  status: string; created_at: string;
}

function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("id,order_number,listing_title,amount_inr,commission_inr,seller_payout_inr,status,created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [user]);

  const markDelivered = async (id: string) => {
    const { error } = await supabase.from("orders").update({ status: "delivered", delivered_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Marked as delivered"); void load(); }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Incoming orders</h2>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-surface animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-muted-foreground">No orders yet.</div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated border-b border-border">
              <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-left px-5 py-3">Listing</th>
                <th className="text-right px-5 py-3">Payout</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4 font-mono text-xs">{o.order_number}<div className="text-muted-foreground">{timeAgo(o.created_at)}</div></td>
                  <td className="px-5 py-4">{o.listing_title}</td>
                  <td className="px-5 py-4 text-right tabular-nums font-semibold">{formatINR(o.seller_payout_inr)}<div className="font-mono text-[10px] text-muted-foreground">of {formatINR(o.amount_inr)}</div></td>
                  <td className="px-5 py-4"><span className="font-mono text-[10px] uppercase tracking-widest">{o.status.replace("_", " ")}</span></td>
                  <td className="px-5 py-4 text-right">
                    {o.status === "paid" || o.status === "in_progress" ? (
                      <button onClick={() => markDelivered(o.id)} className="text-xs font-semibold text-crimson hover:text-crimson-glow uppercase tracking-wider">
                        Mark delivered
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

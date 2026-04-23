import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

interface AdminOrder {
  id: string; order_number: string; listing_title: string;
  amount_inr: number; commission_inr: number; seller_payout_inr: number;
  status: string; created_at: string;
}

function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase.from("orders").select("id,order_number,listing_title,amount_inr,commission_inr,seller_payout_inr,status,created_at").order("created_at", { ascending: false }).limit(100).then(({ data }) => {
      setOrders((data ?? []) as AdminOrder[]);
      setLoading(false);
    });
  }, []);

  const totalCommission = orders.filter(o => o.status === "completed").reduce((s, o) => s + o.commission_inr, 0);

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Total orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-bold">{orders.filter(o => o.status === "completed").length}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-crimson mb-1">Commission earned</p>
          <p className="text-2xl font-bold">{formatINR(totalCommission)}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">All orders</h2>
      {loading ? <div className="h-40 bg-surface rounded-lg animate-pulse" /> :
       orders.length === 0 ? <div className="glass rounded-2xl py-16 text-center text-muted-foreground">No orders.</div> : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated border-b border-border">
              <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left px-5 py-3">Order</th>
                <th className="text-left px-5 py-3">Listing</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-right px-5 py-3">Commission</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4 font-mono text-xs">{o.order_number}<div className="text-muted-foreground">{timeAgo(o.created_at)}</div></td>
                  <td className="px-5 py-4">{o.listing_title}</td>
                  <td className="px-5 py-4 text-right tabular-nums font-semibold">{formatINR(o.amount_inr)}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-crimson">{formatINR(o.commission_inr)}</td>
                  <td className="px-5 py-4 font-mono text-[10px] uppercase tracking-widest">{o.status.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

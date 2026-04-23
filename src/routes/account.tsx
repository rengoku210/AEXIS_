import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/hooks/use-auth";
import { formatINR, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

interface Order { id: string; order_number: string; listing_title: string; amount_inr: number; status: string; created_at: string; }

function AccountPage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "login", redirect: "/account" } });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    void supabase.from("orders").select("id,order_number,listing_title,amount_inr,status,created_at").eq("buyer_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setOrders((data ?? []) as Order[]));
  }, [user]);

  if (!user) return <SiteShell><div className="px-6 py-32 text-center text-muted-foreground">Loading…</div></SiteShell>;

  return (
    <SiteShell>
      <div className="px-6 pt-12 pb-24 max-w-5xl mx-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— Account</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Welcome, {profile?.display_name}</h1>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link to="/marketplace" className="glass rounded-2xl p-6 hover:border-crimson/40 border border-border transition-colors">
            <p className="font-mono text-[10px] uppercase tracking-widest text-crimson mb-2">Browse</p>
            <p className="font-semibold">Explore marketplace</p>
          </Link>
          <Link to="/sell" className="glass rounded-2xl p-6 hover:border-crimson/40 border border-border transition-colors">
            <p className="font-mono text-[10px] uppercase tracking-widest text-crimson mb-2">Earn</p>
            <p className="font-semibold">Become a seller</p>
          </Link>
          <div className="glass rounded-2xl p-6 border border-border">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Email</p>
            <p className="font-semibold text-sm truncate">{user.email}</p>
          </div>
        </div>

        <h2 className="mt-12 mb-4 text-xl font-bold">Your orders</h2>
        {orders.length === 0 ? (
          <div className="glass rounded-2xl py-16 text-center text-muted-foreground">No orders yet.</div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-elevated border-b border-border">
                <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="text-left px-5 py-3">Order</th>
                  <th className="text-left px-5 py-3">Listing</th>
                  <th className="text-right px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface-elevated">
                    <td className="px-5 py-4 font-mono text-xs">
                      <Link to="/account/orders/$orderId" params={{ orderId: o.id }} className="hover:text-crimson">{o.order_number}</Link>
                      <div className="text-muted-foreground">{timeAgo(o.created_at)}</div>
                    </td>
                    <td className="px-5 py-4">{o.listing_title}</td>
                    <td className="px-5 py-4 text-right tabular-nums font-semibold">{formatINR(o.amount_inr)}</td>
                    <td className="px-5 py-4 font-mono text-[10px] uppercase tracking-widest">{o.status.replace("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SiteShell>
  );
}

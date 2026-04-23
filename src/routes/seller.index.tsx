import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatINR, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/seller/")({
  component: SellerListings,
});

interface MyListing {
  id: string; slug: string; title: string; price_inr: number;
  status: string; rejection_reason: string | null;
  view_count: number; order_count: number; created_at: string;
}

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  active: "bg-green-500/10 text-green-500 border-green-500/30",
  rejected: "bg-crimson/10 text-crimson border-crimson/30",
  draft: "bg-muted text-muted-foreground border-border",
  suspended: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  expired: "bg-muted text-muted-foreground border-border",
  sold: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

function SellerListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("listings")
      .select("id,slug,title,price_inr,status,rejection_reason,view_count,order_count,created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setListings((data ?? []) as MyListing[]);
        setLoading(false);
      });
  }, [user]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Your listings</h2>
        <Link to="/seller/new" className="bg-crimson px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-crimson-glow transition-colors">
          + New listing
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-surface animate-pulse" />)}</div>
      ) : listings.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— No Listings</p>
          <p className="text-muted-foreground mb-6">Create your first listing to start selling.</p>
          <Link to="/seller/new" className="inline-block bg-crimson px-6 py-3 rounded-lg font-semibold">Create listing</Link>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated border-b border-border">
              <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-right px-5 py-3 hidden md:table-cell">Views</th>
                <th className="text-right px-5 py-3 hidden md:table-cell">Orders</th>
                <th className="text-right px-5 py-3 hidden md:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface-elevated transition-colors">
                  <td className="px-5 py-4">
                    {l.status === "active" ? (
                      <Link to="/listing/$slug" params={{ slug: l.slug }} className="font-semibold hover:text-crimson">{l.title}</Link>
                    ) : (
                      <span className="font-semibold">{l.title}</span>
                    )}
                    {l.rejection_reason && <p className="text-xs text-crimson mt-1">Reason: {l.rejection_reason}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-widest ${statusBadge[l.status] ?? statusBadge.draft}`}>{l.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums font-semibold">{formatINR(l.price_inr)}</td>
                  <td className="px-5 py-4 text-right tabular-nums hidden md:table-cell text-muted-foreground">{l.view_count}</td>
                  <td className="px-5 py-4 text-right tabular-nums hidden md:table-cell text-muted-foreground">{l.order_count}</td>
                  <td className="px-5 py-4 text-right hidden md:table-cell text-xs text-muted-foreground">{timeAgo(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

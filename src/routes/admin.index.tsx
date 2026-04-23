import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, timeAgo } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminListings,
});

interface AdminListing {
  id: string; title: string; slug: string; price_inr: number; status: string;
  created_at: string; rejection_reason: string | null;
  profiles: { display_name: string | null } | null;
  categories: { name: string } | null;
}

function AdminListings() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("listings")
      .select("id,title,slug,price_inr,status,created_at,rejection_reason,profiles(display_name),categories(name)")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as "pending");
    const { data } = await q;
    setListings((data ?? []) as unknown as AdminListing[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [filter]);

  const approve = async (id: string) => {
    const { error } = await supabase.from("listings").update({ status: "active", approved_at: new Date().toISOString(), rejection_reason: null }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Approved"); void load(); }
  };
  const reject = async (id: string) => {
    const reason = window.prompt("Rejection reason?");
    if (!reason) return;
    const { error } = await supabase.from("listings").update({ status: "rejected", rejection_reason: reason }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Rejected"); void load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Listings moderation</h2>
        <div className="flex gap-2">
          {["pending", "active", "rejected", "all"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest rounded border transition-colors ${
              filter === f ? "bg-crimson border-crimson text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-crimson/50"
            }`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-20 bg-surface rounded-lg animate-pulse"/>)}</div> :
       listings.length === 0 ? <div className="glass rounded-2xl py-16 text-center text-muted-foreground">No listings.</div> : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated border-b border-border">
              <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3">Seller</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Category</th>
                <th className="text-right px-5 py-3">Price</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(l.created_at)}</p>
                    {l.rejection_reason && <p className="text-xs text-crimson mt-1">{l.rejection_reason}</p>}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{l.profiles?.display_name ?? "—"}</td>
                  <td className="px-5 py-4 hidden md:table-cell text-muted-foreground">{l.categories?.name}</td>
                  <td className="px-5 py-4 text-right tabular-nums font-semibold">{formatINR(l.price_inr)}</td>
                  <td className="px-5 py-4 font-mono text-[10px] uppercase tracking-widest">{l.status}</td>
                  <td className="px-5 py-4 text-right space-x-2">
                    {l.status === "pending" && (
                      <>
                        <button onClick={() => approve(l.id)} className="text-xs font-semibold text-green-500 hover:text-green-400 uppercase tracking-wider">Approve</button>
                        <button onClick={() => reject(l.id)} className="text-xs font-semibold text-crimson hover:text-crimson-glow uppercase tracking-wider">Reject</button>
                      </>
                    )}
                    {l.status === "active" && <button onClick={() => reject(l.id)} className="text-xs font-semibold text-crimson uppercase">Suspend</button>}
                    {l.status === "rejected" && <button onClick={() => approve(l.id)} className="text-xs font-semibold text-green-500 uppercase">Approve</button>}
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

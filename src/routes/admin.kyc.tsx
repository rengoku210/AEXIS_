import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/admin/kyc")({
  component: AdminKyc,
});

interface KycRow {
  id: string; seller_id: string; legal_name: string; phone: string;
  id_type: string; id_number: string; id_document_url: string | null;
  city: string | null; state: string | null; status: string;
  rejection_reason: string | null; submitted_at: string;
  profiles: { display_name: string | null; username: string | null } | null;
}

function AdminKyc() {
  const [rows, setRows] = useState<KycRow[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("seller_kyc")
      .select("id,seller_id,legal_name,phone,id_type,id_number,id_document_url,city,state,status,rejection_reason,submitted_at,profiles!seller_kyc_seller_id_fkey(display_name,username)")
      .order("submitted_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as never);
    const { data } = await q;
    setRows((data ?? []) as unknown as KycRow[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [filter]);

  const approve = async (row: KycRow) => {
    const { error } = await supabase.from("seller_kyc").update({
      status: "approved", reviewed_at: new Date().toISOString(),
    }).eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from("profiles").update({ seller_status: "approved" }).eq("id", row.seller_id);
    toast.success("KYC approved");
    void load();
  };

  const reject = async (row: KycRow) => {
    const reason = window.prompt("Reason for rejection?");
    if (!reason) return;
    const { error } = await supabase.from("seller_kyc").update({
      status: "rejected", rejection_reason: reason, reviewed_at: new Date().toISOString(),
    }).eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from("profiles").update({ seller_status: "rejected" }).eq("id", row.seller_id);
    toast.success("KYC rejected");
    void load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Seller KYC review</h2>
        <div className="flex gap-2">
          {["pending", "approved", "rejected", "all"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest rounded border transition-colors ${
              filter === f ? "bg-crimson border-crimson text-foreground" : "border-border text-muted-foreground hover:text-foreground"
            }`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 bg-surface rounded-lg animate-pulse" />)}</div>
       : rows.length === 0 ? <div className="glass rounded-2xl py-16 text-center text-muted-foreground">No KYC submissions.</div>
       : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold">{r.legal_name}</p>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">@{r.profiles?.username ?? "—"}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${
                      r.status === "approved" ? "bg-green-500/15 text-green-500" :
                      r.status === "rejected" ? "bg-crimson/15 text-crimson" :
                      "bg-yellow-500/15 text-yellow-500"
                    }`}>{r.status}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                    <div><p className="font-mono uppercase tracking-widest text-[9px] mb-0.5">Phone</p><p className="text-foreground">{r.phone}</p></div>
                    <div><p className="font-mono uppercase tracking-widest text-[9px] mb-0.5">{r.id_type}</p><p className="text-foreground tabular-nums">{r.id_number}</p></div>
                    <div><p className="font-mono uppercase tracking-widest text-[9px] mb-0.5">Location</p><p className="text-foreground">{[r.city, r.state].filter(Boolean).join(", ") || "—"}</p></div>
                    <div><p className="font-mono uppercase tracking-widest text-[9px] mb-0.5">Submitted</p><p className="text-foreground">{timeAgo(r.submitted_at)}</p></div>
                  </div>
                  {r.rejection_reason && <p className="text-xs text-crimson mt-2">Reason: {r.rejection_reason}</p>}
                  {r.id_document_url && (
                    <p className="mt-2 text-xs"><a href={r.id_document_url} target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline">View ID document →</a></p>
                  )}
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => approve(r)} className="text-xs font-semibold text-green-500 hover:text-green-400 uppercase tracking-wider px-2">Approve</button>
                    <button onClick={() => reject(r)} className="text-xs font-semibold text-crimson hover:text-crimson-glow uppercase tracking-wider px-2">Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
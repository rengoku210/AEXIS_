import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ShieldCheck, TrendingUp, Headphones, Zap } from "lucide-react";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell on Aexis — Premier Gaming Marketplace" },
      { name: "description", content: "Become a verified Aexis vendor. Reach thousands of premium buyers with bank-grade escrow and dispute protection." },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const { user, profile, isSeller, refresh } = useAuth();
  const navigate = useNavigate();
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const status = profile?.seller_status ?? "none";

  const becomeSeller = async () => {
    if (!user) { navigate({ to: "/auth", search: { mode: "signup", redirect: "/sell" } }); return; }
    if (!agreeChecked) { toast.error("Please accept the seller agreement"); return; }
    setLoading(true);
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ seller_status: "approved", seller_agreement_accepted_at: new Date().toISOString() })
      .eq("id", user.id);
    if (profileErr) { toast.error(profileErr.message); setLoading(false); return; }
    // Insert seller role (idempotent due to unique constraint)
    await supabase.from("user_roles").insert({ user_id: user.id, role: "seller" }).select();
    await refresh();
    setLoading(false);
    toast.success("Welcome aboard. Your seller account is active.");
    navigate({ to: "/seller" });
  };

  return (
    <SiteShell>
      <section className="px-6 pt-16 pb-12 max-w-5xl mx-auto text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-4">— Aexis Vendor Program</p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
          Monetize your <span className="text-crimson">expertise</span>.
        </h1>
        <p className="mt-6 text-muted-foreground max-w-2xl mx-auto font-light text-lg leading-relaxed">
          Join an elite network of vetted gaming professionals. Set your own prices. Keep up to 90% of every sale.
        </p>
      </section>

      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
          {[
            { Icon: TrendingUp, label: "Reach", value: "Premium" },
            { Icon: ShieldCheck, label: "Escrow", value: "Built-in" },
            { Icon: Headphones, label: "Support", value: "24/7" },
            { Icon: Zap, label: "Payouts", value: "Fast" },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="bg-surface p-6 text-center">
              <Icon className="size-5 text-crimson mx-auto mb-3" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className="text-lg font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 max-w-3xl mx-auto">
        <div className="glass-strong rounded-2xl p-8">
          {isSeller || status === "approved" ? (
            <div className="text-center py-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— Active Vendor</p>
              <h2 className="text-2xl font-bold mb-2">You're a verified seller</h2>
              <p className="text-muted-foreground mb-6">Manage your listings, orders, and payouts from your seller dashboard.</p>
              <Link to="/seller" className="inline-block bg-crimson px-6 py-3 rounded-lg font-semibold">Go to seller dashboard</Link>
            </div>
          ) : (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— Seller Agreement</p>
              <h2 className="text-2xl font-bold mb-4">Vendor terms & conditions</h2>
              <div className="text-sm text-muted-foreground font-light leading-relaxed space-y-3 max-h-64 overflow-y-auto pr-2 border border-border rounded-lg p-4 bg-surface">
                <p>By becoming an Aexis vendor you agree to:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Provide truthful, accurate descriptions of all listings.</li>
                  <li>Deliver services and assets within the stated delivery window.</li>
                  <li>Honor refund requests in line with the Aexis Refund Policy.</li>
                  <li>Payments are processed via Razorpay and credited directly to the store's verified bank account.</li>
                  <li>Complete identity verification (KYC) before your listings are activated.</li>
                  <li>Aexis acts as a marketplace platform — sellers are responsible for delivery and tax compliance.</li>
                  <li>Violations of platform rules may result in suspension or permanent removal.</li>
                </ul>
                <p>Read the full <Link to="/legal/seller-agreement" className="text-crimson hover:underline">Seller Agreement</Link> for complete terms.</p>
              </div>

              <label className="mt-6 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeChecked}
                  onChange={(e) => setAgreeChecked(e.target.checked)}
                  className="mt-0.5 size-4 accent-crimson"
                />
                <span className="text-sm text-muted-foreground">I have read and accept the Aexis Seller Agreement, Refund Policy, and Terms of Service.</span>
              </label>

              <button
                onClick={becomeSeller}
                disabled={loading}
                className="mt-6 w-full bg-crimson text-foreground py-3.5 rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-crimson-glow disabled:opacity-50 transition-colors"
              >
                {loading ? "Activating..." : user ? "Activate seller account" : "Sign up & become a seller"}
              </button>
            </>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

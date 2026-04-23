import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/seller")({
  component: SellerLayout,
});

function SellerLayout() {
  const { user, isSeller, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "login", redirect: "/seller" } });
    else if (!loading && user && !isSeller) navigate({ to: "/sell" });
  }, [loading, user, isSeller, navigate]);

  if (loading || !user || !isSeller) {
    return <SiteShell><div className="px-6 py-32 text-center text-muted-foreground">Loading…</div></SiteShell>;
  }

  return (
    <SiteShell>
      <div className="px-6 pt-10 max-w-7xl mx-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— Vendor Console</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Seller dashboard</h1>
        <nav className="mt-6 flex gap-1 border-b border-border overflow-x-auto">
          {[
            { to: "/seller", label: "Listings", exact: true },
            { to: "/seller/new", label: "New listing" },
            { to: "/seller/orders", label: "Orders" },
            { to: "/seller/kyc", label: "KYC" },
          ].map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.exact }}
              activeProps={{ className: "border-crimson text-foreground" }}
              className="px-4 py-3 text-xs font-mono uppercase tracking-widest border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="px-6 py-8 max-w-7xl mx-auto"><Outlet /></div>
    </SiteShell>
  );
}

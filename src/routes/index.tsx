import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/layout/SiteShell";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { Search, ShieldCheck, Lock, Headphones, Gamepad2, GraduationCap, TrendingUp, Coins } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aexis — The Premier Marketplace for Elite Gaming Assets" },
      { name: "description", content: "Vetted vendors, secure escrow, premium gaming services. Buy and sell game accounts, coaching, rank boosting, and in-game credits." },
      { property: "og:title", content: "Aexis — Elite Gaming Marketplace" },
      { property: "og:description", content: "Vetted vendors, secure escrow, premium gaming services." },
    ],
  }),
  component: HomePage,
});

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "game-accounts": Gamepad2,
  "coaching": GraduationCap,
  "rank-boosting": TrendingUp,
  "in-game-credits": Coins,
};

interface CategoryRow { id: string; slug: string; name: string; description: string | null; }
interface ListingRow {
  id: string; slug: string; title: string; price_inr: number;
  cover_image_url: string | null; rating_avg: number; rating_count: number;
  is_featured: boolean; delivery_time_hours: number;
  profiles: { display_name: string | null } | null;
}

function HomePage() {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [featured, setFeatured] = useState<ListingRow[]>([]);

  useEffect(() => {
    void (async () => {
      const [cats, lists] = await Promise.all([
        supabase.from("categories").select("id,slug,name,description").eq("is_active", true).order("sort_order"),
        supabase
          .from("listings")
          .select("id,slug,title,price_inr,cover_image_url,rating_avg,rating_count,is_featured,delivery_time_hours,profiles(display_name)")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      if (cats.data) setCategories(cats.data);
      if (lists.data) setFeatured(lists.data as unknown as ListingRow[]);
    })();
  }, []);

  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-crimson/20 bg-oxblood/20 backdrop-blur-md mb-10">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-crimson" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-crimson uppercase">Exclusive Access Network</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-balance leading-[0.9] mb-8">
            ACQUIRE THE
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-zinc-400 to-zinc-600">ULTIMATE</span> ADVANTAGE.
          </h1>

          <p className="text-muted-foreground text-base md:text-lg font-light text-pretty max-w-[55ch] mx-auto mb-12 leading-relaxed">
            The premier clandestine marketplace for elite gaming assets. Rigorously vetted vendors. Bank-grade escrow. Absolute discretion for those who demand the highest tier of play.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); window.location.href = `/marketplace?q=${encodeURIComponent(query)}`; }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-oxblood to-void rounded-xl blur-sm opacity-50" />
            <div className="relative flex items-center bg-surface-elevated border border-border rounded-xl p-2 shadow-2xl hover:border-white/20 transition-colors">
              <div className="pl-4 pr-3 text-muted-foreground"><Search className="size-4" /></div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search accounts, ranks, coaches, vendors..."
                className="flex-1 bg-transparent py-3.5 text-foreground placeholder:text-muted-foreground/60 outline-none font-light min-w-0 text-sm"
              />
              <button type="submit" className="bg-crimson text-foreground px-6 py-3 rounded-lg font-semibold tracking-wider text-xs uppercase hover:bg-crimson-glow transition-colors shrink-0">
                Locate
              </button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-10 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            <div className="flex items-center gap-2"><ShieldCheck className="size-3 text-crimson" /> Verified Sellers</div>
            <div className="flex items-center gap-2"><Lock className="size-3 text-crimson" /> Secure Escrow</div>
            <div className="flex items-center gap-2"><Headphones className="size-3 text-crimson" /> 24/7 Concierge</div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="relative px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— Market Sectors</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Browse by category</h2>
            </div>
            <Link to="/marketplace" className="hidden md:inline font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c, i) => {
              const Icon = CATEGORY_ICONS[c.slug] ?? Gamepad2;
              return (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="group relative h-64 rounded-2xl overflow-hidden glass border border-border transition-all duration-500 hover:border-crimson/50 hover:shadow-[var(--shadow-glow-crimson)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-oxblood/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs tracking-widest text-muted-foreground group-hover:text-crimson transition-colors">/0{i + 1}</span>
                      <Icon className="size-6 text-muted-foreground group-hover:text-crimson transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">{c.name}</h3>
                      <p className="text-xs text-muted-foreground font-light leading-relaxed line-clamp-2">{c.description}</p>
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-crimson opacity-0 group-hover:opacity-100 transition-opacity">Enter sector →</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      {featured.length > 0 && (
        <section className="relative px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— Live Inventory</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Recently listed</h2>
              </div>
              <Link to="/marketplace" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                Browse all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featured.map((l) => (
                <ListingCard key={l.id} listing={l} sellerName={l.profiles?.display_name} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRUST BAND */}
      <section className="relative px-6 pb-24">
        <div className="max-w-7xl mx-auto glass-strong rounded-3xl p-12 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— The Aexis Standard</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
            Built for those who demand <span className="text-crimson">absolute</span> trust.
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground font-light leading-relaxed">
            Every vendor is manually vetted. Every transaction is escrowed. Every dispute is resolved by humans, not bots.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
            <div className="bg-surface p-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Vetted Sellers</p>
              <p className="text-4xl font-bold tabular-nums">100<span className="text-crimson">%</span></p>
              <p className="mt-2 text-xs text-muted-foreground">KYC verification mandatory</p>
            </div>
            <div className="bg-surface p-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Dispute Window</p>
              <p className="text-4xl font-bold tabular-nums">24<span className="text-crimson">h</span></p>
              <p className="mt-2 text-xs text-muted-foreground">Human review SLA</p>
            </div>
            <div className="bg-surface p-8">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Payment Security</p>
              <p className="text-4xl font-bold tabular-nums">PCI<span className="text-crimson">.1</span></p>
              <p className="mt-2 text-xs text-muted-foreground">Bank-grade encryption</p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

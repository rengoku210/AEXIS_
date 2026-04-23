import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/layout/SiteShell";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { Search } from "lucide-react";

interface MarketSearch { q?: string; category?: string }

export const Route = createFileRoute("/marketplace")({
  validateSearch: (s: Record<string, unknown>): MarketSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Marketplace — Aexis" },
      { name: "description", content: "Browse all live gaming listings: accounts, coaching, rank boosts, and in-game credits." },
    ],
  }),
  component: MarketplacePage,
});

interface ListingRow {
  id: string; slug: string; title: string; price_inr: number;
  cover_image_url: string | null; rating_avg: number; rating_count: number;
  is_featured: boolean; delivery_time_hours: number; category_id: string;
  profiles: { display_name: string | null } | null;
}
interface CategoryRow { id: string; slug: string; name: string }

function MarketplacePage() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(search.category);

  useEffect(() => {
    void supabase.from("categories").select("id,slug,name").eq("is_active", true).order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    void (async () => {
      let query = supabase
        .from("listings")
        .select("id,slug,title,price_inr,cover_image_url,rating_avg,rating_count,is_featured,delivery_time_hours,category_id,profiles(display_name)")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(60);

      if (activeCategory) {
        const cat = categories.find((c) => c.slug === activeCategory);
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (search.q) query = query.ilike("title", `%${search.q}%`);

      const { data } = await query;
      if (data) setListings(data as unknown as ListingRow[]);
      setLoading(false);
    })();
  }, [activeCategory, search.q, categories]);

  return (
    <SiteShell>
      <section className="px-6 pt-12 pb-8 max-w-7xl mx-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— Marketplace</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Live inventory</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl font-light">All listings have been verified by Aexis moderators and the seller's identity confirmed.</p>

        <form
          onSubmit={(e) => { e.preventDefault(); window.location.href = `/marketplace?q=${encodeURIComponent(q)}${activeCategory ? `&category=${activeCategory}` : ""}`; }}
          className="mt-8 flex gap-2 max-w-2xl"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search listings..."
              className="w-full bg-surface-elevated border border-border rounded-lg pl-11 pr-4 py-3 text-sm font-light outline-none focus:border-crimson/50 transition-colors"
            />
          </div>
          <button className="bg-crimson text-foreground px-6 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider hover:bg-crimson-glow transition-colors">Search</button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(undefined)}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest border transition-colors ${
              !activeCategory ? "bg-crimson border-crimson text-foreground" : "border-border text-muted-foreground hover:border-crimson/50 hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.slug)}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest border transition-colors ${
                activeCategory === c.slug ? "bg-crimson border-crimson text-foreground" : "border-border text-muted-foreground hover:border-crimson/50 hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-32 glass rounded-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— Empty Sector</p>
            <h2 className="text-2xl font-bold mb-2">No listings yet</h2>
            <p className="text-muted-foreground mb-6">Be the first vendor in this category.</p>
            <Link to="/sell" className="inline-block bg-crimson px-6 py-3 rounded-lg font-semibold text-sm">List an asset</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} sellerName={l.profiles?.display_name} />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}

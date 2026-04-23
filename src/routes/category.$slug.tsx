import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/layout/SiteShell";
import { ListingCard } from "@/components/marketplace/ListingCard";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  errorComponent: ({ error }) => (
    <SiteShell>
      <div className="px-6 py-32 text-center">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    </SiteShell>
  ),
});

interface Category { id: string; name: string; description: string | null; slug: string }
interface ListingRow {
  id: string; slug: string; title: string; price_inr: number;
  cover_image_url: string | null; rating_avg: number; rating_count: number;
  is_featured: boolean; delivery_time_hours: number;
  profiles: { display_name: string | null } | null;
}

function CategoryPage() {
  const { slug } = Route.useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data: cat } = await supabase.from("categories").select("id,name,description,slug").eq("slug", slug).maybeSingle();
      if (!cat) { setMissing(true); setLoading(false); return; }
      setCategory(cat);
      const { data: lists } = await supabase
        .from("listings")
        .select("id,slug,title,price_inr,cover_image_url,rating_avg,rating_count,is_featured,delivery_time_hours,profiles(display_name)")
        .eq("status", "active")
        .eq("category_id", cat.id)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
      setListings((lists ?? []) as unknown as ListingRow[]);
      setLoading(false);
    })();
  }, [slug]);

  if (missing) {
    return (
      <SiteShell>
        <div className="px-6 py-32 text-center max-w-2xl mx-auto">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— Sector Not Found</p>
          <h1 className="text-4xl font-bold mb-4">Unknown category</h1>
          <Link to="/marketplace" className="inline-block bg-crimson px-6 py-3 rounded-lg font-semibold">Browse marketplace</Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="px-6 pt-12 pb-8 max-w-7xl mx-auto">
        <Link to="/marketplace" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">← Marketplace</Link>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mt-6 mb-3">— Category</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{category?.name}</h1>
        {category?.description && (
          <p className="mt-3 text-muted-foreground max-w-2xl font-light">{category.description}</p>
        )}
      </section>
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/3] rounded-2xl bg-surface animate-pulse" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="glass rounded-2xl py-24 text-center">
            <p className="text-muted-foreground">No listings in this sector yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {listings.map((l) => <ListingCard key={l.id} listing={l} sellerName={l.profiles?.display_name} />)}
          </div>
        )}
      </section>
    </SiteShell>
  );
}

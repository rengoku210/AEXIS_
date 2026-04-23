import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/layout/SiteShell";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { ShieldCheck, Star } from "lucide-react";

export const Route = createFileRoute("/seller/$username")({
  component: SellerProfile,
});

interface Profile { id: string; username: string | null; display_name: string | null; avatar_url: string | null; bio: string | null; rating_avg: number; rating_count: number; seller_status: string; created_at: string; }
interface Listing { id: string; slug: string; title: string; price_inr: number; cover_image_url: string | null; rating_avg: number; rating_count: number; is_featured: boolean; delivery_time_hours: number; }

function SellerProfile() {
  const { username } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("id,username,display_name,avatar_url,bio,rating_avg,rating_count,seller_status,created_at")
        .or(`username.eq.${username},id.eq.${username}`)
        .maybeSingle();
      if (p) {
        setProfile(p);
        const { data: l } = await supabase
          .from("listings")
          .select("id,slug,title,price_inr,cover_image_url,rating_avg,rating_count,is_featured,delivery_time_hours")
          .eq("seller_id", p.id)
          .eq("status", "active")
          .order("created_at", { ascending: false });
        setListings((l ?? []) as Listing[]);
      }
      setLoading(false);
    })();
  }, [username]);

  if (loading) return <SiteShell><div className="px-6 py-32 text-center text-muted-foreground">Loading…</div></SiteShell>;
  if (!profile) return <SiteShell><div className="px-6 py-32 text-center"><h1 className="text-3xl font-bold">Vendor not found</h1><Link to="/marketplace" className="text-crimson hover:underline mt-4 inline-block">Browse marketplace</Link></div></SiteShell>;

  return (
    <SiteShell>
      <section className="px-6 pt-12 pb-8 max-w-7xl mx-auto">
        <div className="glass-strong rounded-2xl p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="size-24 rounded-2xl bg-oxblood flex items-center justify-center text-3xl font-bold border border-crimson/30">
            {(profile.display_name ?? "S").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-2">— Vendor Profile</p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{profile.display_name}</h1>
              {profile.seller_status === "approved" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-crimson/10 border border-crimson/30 text-crimson font-mono text-[10px] uppercase tracking-widest">
                  <ShieldCheck className="size-3" /> Verified
                </span>
              )}
            </div>
            {profile.bio && <p className="mt-3 text-muted-foreground font-light max-w-2xl">{profile.bio}</p>}
            <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
              {profile.rating_count > 0 && (
                <div className="flex items-center gap-1.5"><Star className="size-3.5 fill-crimson text-crimson" /><span className="text-foreground font-semibold">{profile.rating_avg.toFixed(1)}</span> ({profile.rating_count})</div>
              )}
              <span>{listings.length} active listings</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Active listings</h2>
        {listings.length === 0 ? (
          <div className="glass rounded-2xl py-16 text-center text-muted-foreground">No active listings.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {listings.map((l) => <ListingCard key={l.id} listing={l} sellerName={profile.display_name} />)}
          </div>
        )}
      </section>
    </SiteShell>
  );
}

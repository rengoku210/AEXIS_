import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/hooks/use-auth";
import { formatINR } from "@/lib/format";
import { Star, Clock, ShieldCheck, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/server/razorpay.functions";
import { openRazorpayCheckout } from "@/lib/razorpay-client";

export const Route = createFileRoute("/listing/$slug")({
  component: ListingDetail,
});

interface Listing {
  id: string; slug: string; title: string; description: string;
  price_inr: number; delivery_time_hours: number;
  cover_image_url: string | null; images: string[];
  status: string; rating_avg: number; rating_count: number;
  seller_id: string;
  category_id: string;
  profiles: { id: string; username: string | null; display_name: string | null; avatar_url: string | null; rating_avg: number; rating_count: number; seller_status: string } | null;
  categories: { name: string; slug: string } | null;
}

function ListingDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("listings")
        .select("id,slug,title,description,price_inr,delivery_time_hours,cover_image_url,images,status,rating_avg,rating_count,seller_id,category_id,profiles(id,username,display_name,avatar_url,rating_avg,rating_count,seller_status),categories(name,slug)")
        .eq("slug", slug)
        .maybeSingle();
      setListing(data as unknown as Listing);
      setLoading(false);
    })();
  }, [slug]);

  const createOrderFn = useServerFn(createRazorpayOrder);
  const verifyFn = useServerFn(verifyRazorpayPayment);

  const handleBuyNow = async () => {
    if (!user) {
      toast.info("Sign in to place an order");
      navigate({ to: "/auth", search: { mode: "login", redirect: `/listing/${slug}` } });
      return;
    }
    if (!listing) return;
    if (user.id === listing.seller_id) {
      toast.error("You can't buy your own listing");
      return;
    }
    setOrdering(true);
    try {
      const order = await createOrderFn({
        data: { listing_id: listing.id, buyer_notes: notes || undefined },
      });

      await openRazorpayCheckout({
        key: order.razorpayKeyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: "Aexis",
        description: order.listingTitle,
        order_id: order.razorpayOrderId,
        prefill: {
          name: order.buyerName ?? undefined,
          email: order.buyerEmail ?? undefined,
        },
        theme: { color: "#7a0a14" },
        notes: { aexis_order_number: order.orderNumber },
        handler: async (resp) => {
          try {
            await verifyFn({ data: resp });
            toast.success("Payment confirmed");
          } catch (e) {
            // Webhook is the source of truth — show a softer message
            toast.info("Payment received. Confirming with bank…");
          } finally {
            navigate({ to: "/account/orders/$orderId", params: { orderId: order.orderId } });
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled. Your order is on hold.");
            setOrdering(false);
            navigate({ to: "/account/orders/$orderId", params: { orderId: order.orderId } });
          },
          confirm_close: true,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start payment";
      toast.error(msg);
      setOrdering(false);
    }
  };

  if (loading) {
    return <SiteShell><div className="px-6 py-32 max-w-7xl mx-auto animate-pulse"><div className="h-96 bg-surface rounded-2xl" /></div></SiteShell>;
  }
  if (!listing) {
    return (
      <SiteShell>
        <div className="px-6 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Listing not found</h1>
          <Link to="/marketplace" className="text-crimson hover:underline">Return to marketplace</Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="px-6 py-10 max-w-7xl mx-auto">
        <Link to="/marketplace" className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-3" /> Back to marketplace
        </Link>

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          {/* LEFT: media + description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-surface-elevated relative border border-border">
              {listing.cover_image_url ? (
                <img src={listing.cover_image_url} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-oxblood/30 to-surface flex items-center justify-center">
                  <span className="font-mono text-xs text-muted-foreground tracking-widest">NO PREVIEW AVAILABLE</span>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-8">
              {listing.categories && (
                <Link to="/category/$slug" params={{ slug: listing.categories.slug }} className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3 inline-block">— {listing.categories.name}</Link>
              )}
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{listing.title}</h1>
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
                {listing.rating_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="size-4 fill-crimson text-crimson" />
                    <span className="text-foreground font-semibold">{listing.rating_avg.toFixed(1)}</span>
                    <span>({listing.rating_count} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4" /> ~{listing.delivery_time_hours}h delivery
                </div>
              </div>

              <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">— Description</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground font-light leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </div>
            </div>
          </div>

          {/* RIGHT: order panel */}
          <aside className="space-y-4">
            <div className="glass-strong rounded-2xl p-6 sticky top-28">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Starting at</p>
              <p className="text-4xl font-bold mt-1">{formatINR(listing.price_inr)}</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-1">Inclusive of all fees</p>

              <div className="mt-6 space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-crimson" /> Escrowed payment</div>
                <div className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-crimson" /> Verified seller</div>
                <div className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-crimson" /> Dispute protection</div>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional: special instructions for the seller..."
                rows={3}
                className="mt-6 w-full bg-surface-elevated border border-border rounded-lg p-3 text-sm font-light outline-none focus:border-crimson/50 resize-none"
              />

              <button
                onClick={handleBuyNow}
                disabled={ordering}
                className="mt-4 w-full bg-crimson text-foreground py-3.5 rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-crimson-glow disabled:opacity-50 transition-colors"
              >
                {ordering ? "Opening payment…" : `Buy now · ${formatINR(listing.price_inr)}`}
              </button>
              <p className="mt-3 font-mono text-[9px] text-center uppercase tracking-widest text-muted-foreground">
                Payment via UPI / Card / Net Banking / EMI
              </p>
            </div>

            {listing.profiles && (
              <Link
                to="/seller/$username"
                params={{ username: listing.profiles.username ?? listing.profiles.id }}
                className="glass rounded-2xl p-5 block hover:border-crimson/40 transition-colors border border-border"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">— About the seller</p>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-oxblood flex items-center justify-center text-foreground font-bold">
                    {(listing.profiles.display_name ?? "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{listing.profiles.display_name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                      {listing.profiles.seller_status === "approved" ? "Verified Vendor" : "Vendor"}
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}

import { Link } from "@tanstack/react-router";
import { formatINR } from "@/lib/format";
import { Star, Shield } from "lucide-react";

interface ListingCardProps {
  listing: {
    id: string;
    slug: string;
    title: string;
    price_inr: number;
    cover_image_url: string | null;
    rating_avg: number;
    rating_count: number;
    is_featured: boolean;
    delivery_time_hours: number;
  };
  sellerName?: string | null;
}

export function ListingCard({ listing, sellerName }: ListingCardProps) {
  return (
    <Link
      to="/listing/$slug"
      params={{ slug: listing.slug }}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 hover:border-crimson/40 hover:shadow-[var(--shadow-glow-crimson)]"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-surface-elevated">
        {listing.cover_image_url ? (
          <img
            src={listing.cover_image_url}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-oxblood/20 to-surface flex items-center justify-center">
            <span className="font-mono text-xs text-muted-foreground tracking-widest">NO PREVIEW</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
        {listing.is_featured && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-crimson/90 backdrop-blur-sm font-mono text-[9px] uppercase tracking-widest text-white">
            <Shield className="size-2.5" /> Featured
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-crimson-glow transition-colors">
          {listing.title}
        </h3>
        {sellerName && (
          <p className="mt-1 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">by {sellerName}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Starting at</p>
            <p className="text-lg font-bold text-foreground">{formatINR(listing.price_inr)}</p>
          </div>
          {listing.rating_count > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Star className="size-3 fill-crimson text-crimson" />
              <span className="text-foreground font-semibold">{listing.rating_avg.toFixed(1)}</span>
              <span className="text-muted-foreground">({listing.rating_count})</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          <span>~{listing.delivery_time_hours}h delivery</span>
          <span className="text-crimson">View →</span>
        </div>
      </div>
    </Link>
  );
}

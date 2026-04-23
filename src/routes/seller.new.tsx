import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { slugify } from "@/lib/format";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { toast } from "sonner";
import { z } from "zod";
import { Upload, X, Star, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/seller/new")({
  component: NewListing,
});

const schema = z.object({
  title: z.string().trim().min(8, "Title must be at least 8 characters").max(120),
  description: z.string().trim().min(40, "Description must be at least 40 characters").max(4000),
  price_inr: z.number().int().min(1, "Price must be > 0").max(10_000_000),
  delivery_time_hours: z.number().int().min(1).max(720),
  category_id: z.string().uuid("Choose a category"),
  cover_image_url: z.string().url("Add at least one image"),
});

interface CategoryRow { id: string; name: string }

function NewListing() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [delivery, setDelivery] = useState("24");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void supabase.from("categories").select("id,name").eq("is_active", true).order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  if (profile && profile.seller_status !== "approved") {
    return (
      <div className="max-w-xl">
        <div className="glass-strong rounded-2xl p-8 text-center">
          <ShieldAlert className="size-10 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verification required</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {profile.seller_status === "pending"
              ? "Your KYC is under review. You'll be able to publish listings once approved."
              : profile.seller_status === "rejected"
              ? "Your KYC was rejected. Please re-submit to continue."
              : "Complete identity verification before creating listings."}
          </p>
          <Link to="/seller/kyc" className="inline-block bg-crimson px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider">
            {profile.seller_status === "pending" ? "View KYC status" : "Complete KYC"}
          </Link>
        </div>
      </div>
    );
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user) return;
    if (images.length + files.length > 6) {
      toast.error("Maximum 6 images per listing");
      return;
    }
    if (!isCloudinaryConfigured()) {
      toast.error("Image hosting is not configured. Please contact the administrator.");
      return;
    }
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        continue;
      }
      try {
        const result = await uploadToCloudinary(file, {
          folder: `listings/${user.id}`,
          resourceType: "image",
        });
        uploaded.push(result.secure_url);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
        continue;
      }
    }
    if (uploaded.length) {
      const next = [...images, ...uploaded];
      setImages(next);
      if (!coverUrl) setCoverUrl(uploaded[0]);
    }
    setUploading(false);
  };

  const removeImage = (url: string) => {
    const next = images.filter((u) => u !== url);
    setImages(next);
    if (coverUrl === url) setCoverUrl(next[0] ?? "");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      title,
      description,
      price_inr: Number(price),
      delivery_time_hours: Number(delivery),
      category_id: categoryId,
      cover_image_url: coverUrl,
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    setSubmitting(true);
    const baseSlug = slugify(parsed.data.title);
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
    const { error } = await supabase.from("listings").insert({
      seller_id: user.id,
      category_id: parsed.data.category_id,
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      price_inr: parsed.data.price_inr,
      delivery_time_hours: parsed.data.delivery_time_hours,
      cover_image_url: parsed.data.cover_image_url,
      images: images as never,
      status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Listing submitted for review");
    navigate({ to: "/seller" });
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold mb-1">Create a new listing</h2>
      <p className="text-sm text-muted-foreground mb-6">Submitted listings are reviewed by Aexis moderators before going live.</p>

      <form onSubmit={submit} className="glass-strong rounded-2xl p-8 space-y-5">
        <Field label="Listing title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder="e.g. Valorant Immortal account, full agent unlock" className="input-style" />
        </Field>

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Category">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="input-style">
              <option value="">— Select —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Delivery time (hours)">
            <input type="number" min={1} max={720} value={delivery} onChange={(e) => setDelivery(e.target.value)} required className="input-style" />
          </Field>
        </div>

        <Field label="Price (INR)">
          <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required className="input-style" />
          <p className="font-mono text-[10px] text-muted-foreground mt-1">You receive the full amount. Payouts via Razorpay.</p>
        </Field>

        <Field label="Listing images (up to 6)">
          <div className="grid grid-cols-3 gap-3">
            {images.map((url) => (
              <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-surface-elevated">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(url)} className="absolute top-1 right-1 size-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="size-3.5 text-white" />
                </button>
                {coverUrl === url ? (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-crimson text-white text-[9px] font-mono uppercase tracking-widest flex items-center gap-1"><Star className="size-2.5 fill-current" /> Cover</span>
                ) : (
                  <button type="button" onClick={() => setCoverUrl(url)} className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Set cover</button>
                )}
              </div>
            ))}
            {images.length < 6 && (
              <label className="aspect-square rounded-lg border border-dashed border-border bg-surface-elevated hover:border-crimson/40 cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors">
                <Upload className="size-5" />
                <span className="font-mono text-[10px] uppercase tracking-widest">{uploading ? "Uploading…" : "Add image"}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void handleFiles(e.target.files); e.target.value = ""; }} />
              </label>
            )}
          </div>
          <p className="font-mono text-[10px] text-muted-foreground mt-2">PNG, JPG or WebP · max 5MB each. The first image becomes the cover by default.</p>
        </Field>

        <Field label="Detailed description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={8} maxLength={4000} placeholder="Describe what's included, requirements, account state, etc." className="input-style font-light leading-relaxed resize-y" />
        </Field>

        <button type="submit" disabled={submitting} className="w-full bg-crimson text-foreground py-3.5 rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-crimson-glow disabled:opacity-50 transition-colors">
          {submitting ? "Submitting..." : "Submit for review"}
        </button>
      </form>

      <style>{`.input-style { width:100%; background:var(--surface-elevated); border:1px solid var(--border); border-radius:0.5rem; padding:0.75rem 1rem; font-size:0.875rem; color:var(--foreground); outline:none; transition:border-color .15s; }
      .input-style:focus { border-color: oklch(0.55 0.22 25 / 0.5); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">{label}</label>
      {children}
    </div>
  );
}

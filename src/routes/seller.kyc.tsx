import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { toast } from "sonner";
import { z } from "zod";
import { Upload, ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/seller/kyc")({
  component: SellerKyc,
});

const schema = z.object({
  legal_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[+]?[0-9 -]{8,15}$/, "Enter a valid phone number"),
  id_type: z.enum(["aadhaar", "pan", "passport", "driving_license", "voter_id"]),
  id_number: z.string().trim().min(4).max(40),
  address_line: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  pincode: z.string().trim().max(10).optional().or(z.literal("")),
});

interface KycRow {
  id: string; status: string; legal_name: string; phone: string;
  id_type: string; id_number: string; address_line: string | null;
  city: string | null; state: string | null; pincode: string | null;
  rejection_reason: string | null; submitted_at: string;
  id_document_url: string | null;
}

function SellerKyc() {
  const { user } = useAuth();
  const [kyc, setKyc] = useState<KycRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [legalName, setLegalName] = useState("");
  const [phone, setPhone] = useState("");
  const [idType, setIdType] = useState("aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [docUrl, setDocUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("seller_kyc").select("*").eq("seller_id", user.id).maybeSingle();
    setKyc(data as KycRow | null);
    if (data) {
      setLegalName(data.legal_name);
      setPhone(data.phone);
      setIdType(data.id_type);
      setIdNumber(data.id_number);
      setAddress(data.address_line ?? "");
      setCity(data.city ?? "");
      setState(data.state ?? "");
      setPincode(data.pincode ?? "");
      setDocUrl(data.id_document_url ?? "");
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, [user]);

  const uploadDoc = async (file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    if (!isCloudinaryConfigured()) {
      toast.error("Document hosting is not configured. Please contact the administrator.");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, {
        folder: `kyc/${user.id}`,
        resourceType: file.type === "application/pdf" ? "raw" : "image",
      });
      setDocUrl(result.secure_url);
      toast.success("ID document uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({
      legal_name: legalName, phone, id_type: idType, id_number: idNumber,
      address_line: address, city, state, pincode,
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    if (!docUrl) { toast.error("Upload your ID document"); return; }
    setSubmitting(true);
    const payload = {
      seller_id: user.id,
      legal_name: parsed.data.legal_name,
      phone: parsed.data.phone,
      id_type: parsed.data.id_type,
      id_number: parsed.data.id_number,
      address_line: parsed.data.address_line || null,
      city: parsed.data.city || null,
      state: parsed.data.state || null,
      pincode: parsed.data.pincode || null,
      id_document_url: docUrl,
      status: "pending" as const,
      rejection_reason: null,
      submitted_at: new Date().toISOString(),
    };
    const { error } = kyc
      ? await supabase.from("seller_kyc").update(payload).eq("id", kyc.id)
      : await supabase.from("seller_kyc").insert(payload);
    if (error) { toast.error(error.message); setSubmitting(false); return; }
    await supabase.from("profiles").update({ seller_status: "pending" }).eq("id", user.id);
    toast.success("KYC submitted for review");
    setSubmitting(false);
    void load();
  };

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  const status = kyc?.status ?? "not_submitted";
  const canEdit = status === "not_submitted" || status === "rejected" || status === "pending";

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold mb-1">Identity verification (KYC)</h2>
      <p className="text-sm text-muted-foreground mb-6">Required before your listings go live. Reviewed within 24–48 hours.</p>

      <div className={`mb-6 rounded-2xl p-4 border flex items-center gap-3 ${
        status === "approved" ? "border-green-500/30 bg-green-500/5" :
        status === "rejected" ? "border-crimson/30 bg-crimson/5" :
        status === "pending" ? "border-yellow-500/30 bg-yellow-500/5" :
        "border-border bg-surface"
      }`}>
        {status === "approved" && <><CheckCircle2 className="size-5 text-green-500" /><span className="text-sm">Approved · You can publish listings.</span></>}
        {status === "pending" && <><ShieldCheck className="size-5 text-yellow-500" /><span className="text-sm">Under review · We'll notify you once approved.</span></>}
        {status === "rejected" && <><XCircle className="size-5 text-crimson" /><span className="text-sm">Rejected: {kyc?.rejection_reason ?? "Please re-submit."}</span></>}
        {status === "not_submitted" && <><AlertTriangle className="size-5 text-yellow-500" /><span className="text-sm">Not submitted · Complete the form below to start selling.</span></>}
      </div>

      {canEdit && (
        <form onSubmit={submit} className="glass-strong rounded-2xl p-8 space-y-5">
          <Field label="Legal name (as on your ID)">
            <input value={legalName} onChange={(e) => setLegalName(e.target.value)} required className="input-style" />
          </Field>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Phone number">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91 90000 00000" className="input-style" />
            </Field>
            <Field label="ID type">
              <select value={idType} onChange={(e) => setIdType(e.target.value)} className="input-style">
                <option value="aadhaar">Aadhaar</option>
                <option value="pan">PAN Card</option>
                <option value="passport">Passport</option>
                <option value="driving_license">Driving License</option>
                <option value="voter_id">Voter ID</option>
              </select>
            </Field>
          </div>
          <Field label="ID number">
            <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required className="input-style font-mono tracking-wider" />
          </Field>
          <Field label="ID document (front side)">
            <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-border bg-surface-elevated hover:border-crimson/40 cursor-pointer transition-colors">
              <Upload className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground flex-1">{uploading ? "Uploading…" : docUrl ? "Document uploaded · Click to replace" : "Click to upload (max 5MB)"}</span>
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadDoc(f); e.target.value = ""; }} />
            </label>
          </Field>
          <Field label="Address (optional)">
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="input-style" />
          </Field>
          <div className="grid md:grid-cols-3 gap-5">
            <Field label="City"><input value={city} onChange={(e) => setCity(e.target.value)} className="input-style" /></Field>
            <Field label="State"><input value={state} onChange={(e) => setState(e.target.value)} className="input-style" /></Field>
            <Field label="PIN code"><input value={pincode} onChange={(e) => setPincode(e.target.value)} className="input-style" /></Field>
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-crimson text-foreground py-3.5 rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-crimson-glow disabled:opacity-50 transition-colors">
            {submitting ? "Submitting…" : status === "rejected" ? "Re-submit for review" : "Submit for review"}
          </button>
        </form>
      )}

      {!canEdit && (
        <div className="text-center"><Link to="/seller" className="text-crimson hover:underline">← Back to dashboard</Link></div>
      )}

      <style>{`.input-style { width:100%; background:var(--surface-elevated); border:1px solid var(--border); border-radius:0.5rem; padding:0.75rem 1rem; font-size:0.875rem; color:var(--foreground); outline:none; transition:border-color .15s; }
      .input-style:focus { border-color: oklch(0.55 0.22 25 / 0.5); }`}</style>
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
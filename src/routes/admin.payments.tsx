import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getRazorpayConfigStatus } from "@/server/razorpay.functions";
import { CheckCircle2, XCircle, AlertTriangle, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payments")({
  component: AdminPayments,
});

interface ConfigStatus {
  keyIdConfigured: boolean;
  keySecretConfigured: boolean;
  webhookSecretConfigured: boolean;
  keyIdPrefix: "test" | "live" | null;
}

function AdminPayments() {
  const fn = useServerFn(getRazorpayConfigStatus);
  const [status, setStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fn().then((s) => { setStatus(s as ConfigStatus); setLoading(false); });
  }, [fn]);

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/public/razorpay-webhook`
    : "/api/public/razorpay-webhook";

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success("Webhook URL copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  const allGood = status?.keyIdConfigured && status?.keySecretConfigured && status?.webhookSecretConfigured;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-1">Razorpay configuration</h2>
        <p className="text-sm text-muted-foreground">
          This deployment uses a single Razorpay account. All buyer payments are credited directly to the bank account linked to your Razorpay business profile — Aexis takes no commission.
        </p>
      </div>

      <div className={`glass-strong rounded-2xl p-6 border ${allGood ? "border-green-500/30" : "border-yellow-500/30"}`}>
        <div className="flex items-center gap-3 mb-4">
          {allGood ? <CheckCircle2 className="size-5 text-green-500" /> : <AlertTriangle className="size-5 text-yellow-500" />}
          <h3 className="font-semibold">
            {allGood
              ? `Connected · ${status?.keyIdPrefix === "live" ? "LIVE mode" : "TEST mode"}`
              : "Setup incomplete"}
          </h3>
        </div>
        <ul className="space-y-2 text-sm">
          <StatusRow label="RAZORPAY_KEY_ID" ok={!!status?.keyIdConfigured} />
          <StatusRow label="RAZORPAY_KEY_SECRET" ok={!!status?.keySecretConfigured} />
          <StatusRow label="RAZORPAY_WEBHOOK_SECRET" ok={!!status?.webhookSecretConfigured} />
        </ul>
        {status?.keyIdPrefix === "test" && (
          <p className="mt-4 text-xs font-mono uppercase tracking-widest text-yellow-500/80">⚠ Test keys detected — real payments are NOT being collected.</p>
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">One-time setup</h3>
        <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-3 font-light">
          <li>
            Sign in to your <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-crimson hover:underline inline-flex items-center gap-1">Razorpay dashboard <ExternalLink className="size-3" /></a> and complete KYC for live mode.
          </li>
          <li>
            Open <em>Account &amp; Settings → API Keys</em>, generate a key pair, and copy the <code className="text-foreground">Key Id</code> and <code className="text-foreground">Key Secret</code>.
          </li>
          <li>
            Add three environment variables to this deployment: <code className="text-foreground">RAZORPAY_KEY_ID</code>, <code className="text-foreground">RAZORPAY_KEY_SECRET</code>, and <code className="text-foreground">RAZORPAY_WEBHOOK_SECRET</code> (any strong random string you choose). On Vercel, set them in <em>Project Settings → Environment Variables</em>.
          </li>
          <li>
            In Razorpay, go to <em>Settings → Webhooks → Add New Webhook</em>:
            <div className="mt-2 flex items-center gap-2 bg-surface-elevated border border-border rounded p-2">
              <code className="text-xs text-foreground flex-1 truncate">{webhookUrl}</code>
              <button onClick={copyWebhook} className="p-1.5 hover:bg-surface rounded"><Copy className="size-3.5" /></button>
            </div>
            <p className="mt-2 text-xs">Paste your <code className="text-foreground">RAZORPAY_WEBHOOK_SECRET</code> as the secret. Subscribe to <code className="text-foreground">payment.captured</code>, <code className="text-foreground">payment.failed</code>, and <code className="text-foreground">order.paid</code>.</p>
          </li>
          <li>Reload this page — all three rows above should show ✓.</li>
        </ol>
      </div>
    </div>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-center justify-between border-b border-border last:border-0 pb-2 last:pb-0">
      <code className="text-xs text-foreground">{label}</code>
      {ok ? (
        <span className="flex items-center gap-1.5 text-green-500 text-xs"><CheckCircle2 className="size-3.5" /> Set</span>
      ) : (
        <span className="flex items-center gap-1.5 text-crimson text-xs"><XCircle className="size-3.5" /> Missing</span>
      )}
    </li>
  );
}
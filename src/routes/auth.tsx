import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/layout/SiteShell";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { z } from "zod";

interface AuthSearch { mode?: "login" | "signup"; redirect?: string }

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    mode: s.mode === "signup" ? "signup" : "login",
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — Aexis" }] }),
  component: AuthPage,
});

const credSchema = z.object({
  email: z.string().email("Invalid email").max(255),
  password: z.string().min(8, "Min 8 chars").max(72),
  displayName: z.string().min(2).max(60).optional(),
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(search.mode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate({ to: search.redirect ?? "/account" });
    }
  }, [user, navigate, search.redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = credSchema.safeParse({ email, password, displayName: mode === "signup" ? displayName : undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { display_name: displayName },
        },
      });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Account created. You're signed in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Welcome back.");
    }
  };

  return (
    <SiteShell>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— {mode === "signup" ? "Create Account" : "Authenticate"}</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {mode === "signup" ? "Join the network" : "Welcome back"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-8 space-y-5">
            {mode === "signup" && (
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">Display name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={60}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-crimson/50 transition-colors"
                />
              </div>
            )}
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-crimson/50 transition-colors"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-crimson/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-crimson text-foreground py-3.5 rounded-lg font-semibold text-sm uppercase tracking-wider hover:bg-crimson-glow disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : mode === "signup" ? "Create account" : "Sign in"}
            </button>
            <p className="text-center text-xs text-muted-foreground pt-2">
              {mode === "signup" ? "Already a member? " : "New to Aexis? "}
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                className="text-crimson hover:text-crimson-glow font-semibold"
              >
                {mode === "signup" ? "Sign in" : "Create account"}
              </button>
            </p>
          </form>

          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            By continuing you accept the <Link to="/legal/terms" className="text-foreground hover:underline">Terms</Link> & <Link to="/legal/privacy" className="text-foreground hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </SiteShell>
  );
}

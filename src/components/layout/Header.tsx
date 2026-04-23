import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, profile, isAdmin, isSeller, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4">
      <nav className="mx-auto max-w-7xl">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-5 py-3.5 shadow-[var(--shadow-elevated)]">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tighter">
              <span className="block size-3 rounded-sm bg-crimson shadow-[0_0_12px_var(--crimson)]" />
              AEXIS
            </Link>
            <div className="hidden md:flex items-center gap-7 text-sm font-light text-muted-foreground">
              <Link to="/marketplace" className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
                Browse
              </Link>
              <Link to="/sell" className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
                Sell Assets
              </Link>
              <Link to="/about" className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
                About
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-5 text-sm">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="font-mono text-[10px] uppercase tracking-widest text-crimson hover:text-crimson-glow">
                    Admin
                  </Link>
                )}
                {isSeller && (
                  <Link to="/seller" className="font-light text-muted-foreground hover:text-foreground transition-colors">
                    Seller
                  </Link>
                )}
                <Link to="/account" className="font-light text-muted-foreground hover:text-foreground transition-colors">
                  {profile?.display_name ?? "Account"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:border-crimson/50 hover:text-foreground transition-all"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="font-light text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-void hover:bg-crimson hover:text-foreground transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open && (
          <div className="glass-strong md:hidden mt-2 rounded-2xl p-5 flex flex-col gap-4 text-sm">
            <Link to="/marketplace" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">Browse</Link>
            <Link to="/sell" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">Sell Assets</Link>
            <Link to="/about" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">About</Link>
            <div className="h-px bg-border" />
            {user ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="text-crimson font-mono text-xs uppercase">Admin</Link>}
                {isSeller && <Link to="/seller" onClick={() => setOpen(false)} className="text-muted-foreground">Seller dashboard</Link>}
                <Link to="/account" onClick={() => setOpen(false)} className="text-muted-foreground">Account</Link>
                <button onClick={handleSignOut} className="text-left text-muted-foreground">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setOpen(false)} className="text-muted-foreground">Login</Link>
                <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)} className="rounded-lg bg-foreground text-void font-semibold py-2.5 text-center">Get Started</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

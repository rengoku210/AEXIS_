import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tighter">
              <span className="block size-3 rounded-sm bg-crimson" />
              AEXIS
            </Link>
            <p className="mt-4 text-sm text-muted-foreground font-light leading-relaxed max-w-xs">
              The premier clandestine marketplace for elite gaming assets and services.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Marketplace</h4>
            <ul className="space-y-3 text-sm font-light">
              <li><Link to="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Browse all</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "game-accounts" }} className="text-muted-foreground hover:text-foreground transition-colors">Game Accounts</Link></li>
              <li><Link to="/sell" className="text-muted-foreground hover:text-foreground transition-colors">Sell an account</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">How it works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-sm font-light">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/sell" className="text-muted-foreground hover:text-foreground transition-colors">Become a seller</Link></li>
              <li><Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Sign in</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Legal</h4>
            <ul className="space-y-3 text-sm font-light">
              <li><Link to="/legal/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/refund" className="text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link></li>
              <li><Link to="/legal/seller-agreement" className="text-muted-foreground hover:text-foreground transition-colors">Seller Agreement</Link></li>
              <li><Link to="/legal/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className="font-mono text-muted-foreground tracking-wider">© {new Date().getFullYear()} AEXIS NETWORK. ALL RIGHTS RESERVED.</p>
          <p className="font-mono text-muted-foreground tracking-wider">
            <span className="text-crimson">●</span> SECURED MARKETPLACE PROTOCOL v1.0
          </p>
        </div>
      </div>
    </footer>
  );
}

import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-void px-4 overflow-hidden">
      <div className="absolute inset-0 ambient-spotlight pointer-events-none" />
      <div className="relative max-w-md text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] text-crimson uppercase mb-6">Error / 404</p>
        <h1 className="text-7xl font-bold text-foreground tracking-tighter">Lost in the void</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This asset doesn't exist or has been delisted from the network.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-crimson px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-crimson-glow hover:shadow-[var(--shadow-glow-crimson)]"
          >
            Return to marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aexis — The Premier Marketplace for Elite Gaming Assets" },
      { name: "description", content: "Vetted vendors. Bank-grade escrow. Acquire game accounts, coaching, rank boosts and in-game credits with absolute discretion." },
      { name: "author", content: "Aexis" },
      { property: "og:title", content: "Aexis — The Premier Marketplace for Elite Gaming Assets" },
      { property: "og:description", content: "Vetted vendors. Bank-grade escrow. Acquire game accounts, coaching, rank boosts and in-game credits with absolute discretion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Aexis — The Premier Marketplace for Elite Gaming Assets" },
      { name: "twitter:description", content: "Vetted vendors. Bank-grade escrow. Acquire game accounts, coaching, rank boosts and in-game credits with absolute discretion." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Sora:wght@200;300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-void text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster theme="dark" position="top-right" richColors closeButton />
    </AuthProvider>
  );
}

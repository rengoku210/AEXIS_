import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-void text-foreground">
      <div className="fixed inset-0 grid-noise pointer-events-none opacity-40" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[900px] ambient-spotlight rounded-full pointer-events-none -z-0" />
      <div className="fixed top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
      <Header />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
    </div>
  );
}

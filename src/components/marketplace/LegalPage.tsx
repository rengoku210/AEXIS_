import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell";

export function LegalPage({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <SiteShell>
      <div className="px-6 pt-12 pb-24 max-w-3xl mx-auto">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-3">— {eyebrow}</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{title}</h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-10">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose prose-invert max-w-none text-muted-foreground font-light leading-relaxed space-y-5">{children}</div>
      </div>
    </SiteShell>
  );
}

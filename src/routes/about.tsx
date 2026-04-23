import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { ShieldCheck, Lock, Headphones, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Aexis" }, { name: "description", content: "Aexis is a curated marketplace connecting verified gaming vendors with discerning buyers." }] }),
  component: () => (
    <SiteShell>
      <section className="px-6 pt-16 pb-12 max-w-4xl mx-auto text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-crimson mb-4">— About Aexis</p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">A network built on <span className="text-crimson">trust</span>.</h1>
        <p className="mt-6 text-muted-foreground max-w-2xl mx-auto font-light text-lg leading-relaxed">
          Aexis is the premier intermediary marketplace for elite gaming services. We don't sell. We connect — vendors and buyers, with bank-grade security between.
        </p>
      </section>
      <section className="px-6 pb-24 max-w-5xl mx-auto grid md:grid-cols-2 gap-px bg-border rounded-2xl overflow-hidden">
        {[
          { Icon: ShieldCheck, title: "Vetted vendors", body: "Every seller is manually reviewed before going live. Identity verification is mandatory." },
          { Icon: Lock, title: "Escrow by default", body: "Funds are held until the buyer confirms delivery. No exceptions." },
          { Icon: Headphones, title: "Human support", body: "Disputes are resolved by trained moderators within 24 hours, not bots." },
          { Icon: Users, title: "Built to scale", body: "From a single coach to enterprise vendors, our platform grows with you." },
        ].map(({ Icon, title, body }) => (
          <div key={title} className="bg-surface p-8">
            <Icon className="size-6 text-crimson mb-4" />
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground font-light leading-relaxed">{body}</p>
          </div>
        ))}
      </section>
    </SiteShell>
  ),
});

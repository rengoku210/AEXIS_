import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketplace/LegalPage";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Aexis" }] }),
  component: () => (
    <LegalPage title="Privacy Policy" eyebrow="Legal">
      <p>Aexis respects your privacy. This policy explains what we collect, why, and how we protect it.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">Data we collect</h2>
      <p>Account data (email, display name), transaction data (orders, payments), and minimal usage analytics required for fraud prevention.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">How we use it</h2>
      <p>To operate the marketplace, process transactions, prevent abuse, and comply with legal obligations.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">Sharing</h2>
      <p>We share data only with payment processors, infrastructure providers, and authorities when legally required.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">Your rights</h2>
      <p>You may access, correct, or delete your data at any time by contacting support.</p>
    </LegalPage>
  ),
});

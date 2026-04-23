import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketplace/LegalPage";

export const Route = createFileRoute("/legal/seller-agreement")({
  head: () => ({ meta: [{ title: "Seller Agreement — Aexis" }] }),
  component: () => (
    <LegalPage title="Seller Agreement" eyebrow="Vendor Terms">
      <p>This Seller Agreement governs your participation as a vendor on the Aexis platform.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">Listings</h2>
      <p>You warrant that all listings are accurate, that you have the right to sell the asset or provide the service, and that the listing complies with the relevant game publisher's terms.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">Commission & payouts</h2>
      <p>Aexis collects a 10% platform commission on completed sales (configurable by category and plan). Payouts are released to your linked method after the dispute window closes.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">Compliance</h2>
      <p>You agree to deliver within the stated window, respond to buyer messages promptly, and resolve disputes in good faith. Repeated violations may result in suspension or removal.</p>
    </LegalPage>
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketplace/LegalPage";

export const Route = createFileRoute("/legal/refund")({
  head: () => ({ meta: [{ title: "Refund Policy — Aexis" }] }),
  component: () => (
    <LegalPage title="Refund Policy" eyebrow="Legal">
      <p>Buyer funds are held in escrow until delivery is confirmed. If a seller fails to deliver, or delivers an asset not matching the listing, you may open a dispute within 7 days of the delivery date.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">Eligible refunds</h2>
      <ul className="list-disc pl-5">
        <li>Seller fails to deliver within the stated window.</li>
        <li>Delivered asset materially differs from the listing.</li>
        <li>Service rendered is fundamentally different from what was advertised.</li>
      </ul>
      <h2 className="text-foreground font-bold text-xl mt-8">Non-refundable</h2>
      <ul className="list-disc pl-5">
        <li>Buyer's remorse after confirmed delivery.</li>
        <li>Loss of asset due to buyer changing credentials post-delivery.</li>
      </ul>
    </LegalPage>
  ),
});

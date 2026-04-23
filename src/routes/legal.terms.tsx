import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketplace/LegalPage";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Aexis" }] }),
  component: () => (
    <LegalPage title="Terms of Service" eyebrow="Legal">
      <p>Welcome to Aexis. By accessing or using our platform, you agree to these Terms of Service. Aexis is an intermediary marketplace; we connect buyers and sellers but are not the seller of any listing.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">1. Eligibility</h2>
      <p>You must be at least 18 years old and able to enter into binding contracts. Use of Aexis is void where prohibited.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">2. Accounts</h2>
      <p>You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">3. Listings & purchases</h2>
      <p>Sellers warrant that their listings comply with applicable laws and the relevant game's terms of service. Aexis does not own, sell, or guarantee any listing.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">4. Fees</h2>
      <p>Aexis charges a platform commission on completed sales. Current rates are displayed at the time of listing.</p>
      <h2 className="text-foreground font-bold text-xl mt-8">5. Limitation of liability</h2>
      <p>Aexis is provided "as is". To the maximum extent permitted by law, our liability is limited to the platform commission paid on the relevant transaction.</p>
    </LegalPage>
  ),
});

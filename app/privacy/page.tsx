import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Privacy Policy | Dukaan" };

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" description="Last updated: 24 July 2026. Review this page with legal counsel and replace the placeholder support address before launch."><section><h2 className="font-heading text-lg font-semibold text-foreground">Information we collect</h2><p>We collect account details, shop details, billing records, customer details, product and inventory data that you enter to provide Dukaan.</p></section><section><h2 className="font-heading text-lg font-semibold text-foreground">How we use information</h2><p>We use your information to operate the service, generate invoices and reports, provide support, secure accounts, and improve Dukaan. We do not sell your personal information.</p></section><section><h2 className="font-heading text-lg font-semibold text-foreground">Sharing and security</h2><p>We share information only with service providers needed to operate Dukaan, when legally required, or with your instruction. We use reasonable technical and organisational safeguards, but no online system is completely secure.</p></section><section><h2 className="font-heading text-lg font-semibold text-foreground">Your choices</h2><p>You may request access, correction, export, or deletion of your account information, subject to applicable law and records we must retain for legal, tax, or security purposes.</p></section></LegalPage>;
}

import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { title: "Terms of Service | Dukaan" };

export default function TermsPage() {
  return <LegalPage title="Terms of Service" description="Last updated: 24 July 2026. Review this page with legal counsel and replace the placeholder support address before launch."><section><h2 className="font-heading text-lg font-semibold text-foreground">Using Dukaan</h2><p>You are responsible for your account, the accuracy of information you enter, and complying with laws applicable to your business. Dukaan provides software tools and does not provide tax, accounting, or legal advice.</p></section><section><h2 className="font-heading text-lg font-semibold text-foreground">Plans and payments</h2><p>Paid plan charges, renewal dates, and cancellation options are shown before purchase. You can manage a paid subscription through the billing portal. Fees are generally non-refundable except where required by law.</p></section><section><h2 className="font-heading text-lg font-semibold text-foreground">Your data</h2><p>You retain ownership of the business data you enter. You grant us permission to process it only as needed to provide, maintain, and secure Dukaan.</p></section><section><h2 className="font-heading text-lg font-semibold text-foreground">Service availability</h2><p>We aim to keep Dukaan available and reliable, but the service may change or be unavailable at times. To the extent permitted by law, Dukaan is provided without warranties and our liability is limited to amounts paid for the service in the preceding twelve months.</p></section></LegalPage>;
}

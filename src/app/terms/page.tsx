import type { Metadata } from "next";
import { LegalDoc } from "@/components/site/LegalDoc";

export const metadata: Metadata = { title: "Terms of Service — Naija Hub" };

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Service" updated="21 November 2026">
      <p>These Terms govern your use of Naija Hub (the “Service”), including the website, installable web app and desktop app. By creating an account or using the Service you agree to them. If you do not agree, please do not use the Service.</p>

      <h2>1. What Naija Hub is</h2>
      <p>Naija Hub is an offline-first set of everyday utilities for Nigeria: light and token tracking, fuel and price watch, naira reference rates, tax and VAT calculators, bill splitting, Ajo/Esusu tracking, reminders, USSD and emergency codes, and scam checks. It also includes an AI co-pilot that answers questions about these tools.</p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must provide accurate information and be at least 16 years old.</li>
        <li>You are responsible for keeping your password secret and for activity under your account.</li>
        <li>Tell us promptly if you suspect unauthorised access.</li>
      </ul>

      <h2>3. Information is guidance, not advice</h2>
      <p>Prices, exchange rates, power status, transit fares and product verification results are crowd-sourced or reference figures and may be out of date or wrong. Calculators are estimates. Nothing in the Service is financial, tax, legal, medical or safety advice. Always confirm with the relevant provider or authority — for example your DisCo, a bank, the Federal Inland Revenue Service, or NAFDAC — before acting.</p>

      <h2>4. AI co-pilot</h2>
      <p>The co-pilot may produce inaccurate or incomplete answers. Do not rely on it for decisions involving money, health or safety. Do not put passwords, card numbers, BVN/NIN or other highly sensitive data into it. Messages you send may be processed by a third-party AI provider to generate a reply, as described in our <a href="/privacy">Privacy Policy</a>.</p>

      <h2>4A. Health hub</h2>
      <p>The Health hub gives general information and lets you record appointment, antenatal and bed requests. It is not medical advice, does not replace a clinician, and is not an emergency service. Requests are stored for your reference only and are not transmitted to or confirmed by any hospital; nothing is booked until the hospital confirms with you. In an emergency, call 112 (or FRSC 122 for a road crash) or go to the nearest Emergency Unit. Hospital names are listed for convenience and do not imply endorsement or partnership.</p>

      <h2>5. Community reports</h2>
      <p>When you submit a report (for example a power status, a price or a transit alert) you confirm it is honest to the best of your knowledge, and you grant us a non-exclusive licence to display it in the Service. Do not submit unlawful, misleading, abusive or personal content. We may remove content or suspend accounts that break these rules.</p>

      <h2>6. Acceptable use</h2>
      <ul>
        <li>No attempts to break, probe or overload the Service, or to access other users’ data.</li>
        <li>No scraping at a scale that harms performance, and no use of the Service to commit fraud or spread scams.</li>
        <li>No reverse-engineering except where the law allows it.</li>
      </ul>

      <h2>7. Your data on your device</h2>
      <p>Most personal data you enter into the tools (such as bills, Ajo groups and beneficiaries) is stored in your own device’s storage and is not uploaded. Clearing your browser or app data will delete it. Back up anything important.</p>

      <h2>8. Availability and changes</h2>
      <p>We try to keep the Service running but provide it “as is” and “as available”, without warranties of any kind. We may change, suspend or discontinue features at any time. We may update these Terms; if changes are material we will give notice in the Service. Continued use after changes means you accept them.</p>

      <h2>9. Limitation of liability</h2>
      <p>To the maximum extent permitted by law, Naija Hub and its operators are not liable for indirect or consequential loss, or for loss arising from reliance on information, estimates or AI output in the Service. Nothing in these Terms limits liability that cannot be limited by law.</p>

      <h2>10. Termination</h2>
      <p>You may stop using the Service and request deletion of your account at any time. We may suspend or end access if you breach these Terms or to protect the Service or other users.</p>

      <h2>11. Governing law</h2>
      <p>These Terms are governed by the laws of the Federal Republic of Nigeria, and the courts of Nigeria have jurisdiction, subject to any mandatory consumer rights you have where you live.</p>

      <h2>12. Contact</h2>
      <p>Questions about these Terms: <a href="mailto:support@naijahub.app">support@naijahub.app</a>.</p>

      <p className="text-xs text-stone-500 mt-8">This document is a general template and has not been reviewed by a lawyer. Have it reviewed by qualified Nigerian counsel before relying on it commercially.</p>
    </LegalDoc>
  );
}

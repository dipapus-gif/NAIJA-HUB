import type { Metadata } from "next";
import { LegalDoc } from "@/components/site/LegalDoc";

export const metadata: Metadata = { title: "Privacy Policy — Naija Hub" };

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy" updated="21 November 2026">
      <p>This policy explains what personal data Naija Hub collects, why, and the choices you have. It is written with the Nigeria Data Protection Act 2023 (NDPA) in mind.</p>

      <h2>1. Data we collect</h2>
      <ul>
        <li><strong>Account data:</strong> your name, email address and a salted, hashed password (we never store your password in readable form).</li>
        <li><strong>Community reports you submit:</strong> area, street, price, transit or power-status details. These are shown to other users without your name.</li>
        <li><strong>Health requests you submit (sensitive):</strong> if you use the Health hub to record an appointment, antenatal or hospital-bed request, we store the patient's name, phone number, chosen hospital, preferred time and short notes you type. Health information is special-category personal data under the NDPA, so we ask for your consent first, collect only what the form needs, and use it only to give you a reference and let you track the request. We do not send these requests to hospitals, and we do not sell or share them.</li>
        <li><strong>AI co-pilot messages:</strong> the questions you type and the tool context needed to answer them.</li>
        <li><strong>Technical data:</strong> basic server logs (IP address, browser, timestamps) and a session cookie that keeps you logged in.</li>
        <li><strong>Preferences:</strong> your theme and language, stored on your device.</li>
      </ul>

      <h2>2. Data that stays on your device</h2>
      <p>Bills, Ajo/Esusu groups, saved beneficiaries, blocklists, personal prices and light history are stored in your device’s local storage. We do not receive them.</p>

      <h2>3. How we use data</h2>
      <ul>
        <li>To record and let you track health requests you submit.</li>
        <li>To create and secure your account and keep you signed in.</li>
        <li>To show community power, price and transit information.</li>
        <li>To answer your questions through the AI co-pilot.</li>
        <li>To prevent abuse, fix bugs and keep the Service reliable.</li>
      </ul>
      <p>Our lawful bases are performance of our contract with you, our legitimate interests in running a safe service, and your consent where required. We do not sell your personal data and we do not show third-party advertising.</p>

      <h2>4. Service providers</h2>
      <p>We use trusted processors to run the Service: Vercel (hosting), Neon (database) and, when enabled, an AI model provider reached through Vercel AI Gateway to generate co-pilot replies. They process data only to provide their services to us. Some are located outside Nigeria; where data is transferred abroad we rely on appropriate safeguards under the NDPA.</p>

      <h2>5. Cookies and local storage</h2>
      <p>We use one essential, HTTP-only session cookie to keep you logged in, and local storage for theme, language and offline data. We do not use advertising cookies.</p>

      <h2>6. Retention</h2>
      <p>Account data is kept while your account is active. Community reports may be retained in anonymous form. Server logs are kept for a short period for security and debugging. Delete your account and we remove your account data, except where we must keep it by law.</p>

      <h2>7. Your rights</h2>
      <p>You may ask to access, correct, delete or export your personal data, object to or restrict certain processing, withdraw consent, and complain to the Nigeria Data Protection Commission. Email <a href="mailto:privacy@naijahub.app">privacy@naijahub.app</a> and we will respond within a reasonable time.</p>

      <h2>8. Security</h2>
      <p>Passwords are hashed with scrypt, sessions are signed and HTTP-only, and traffic is encrypted in transit. No system is perfectly secure; please use a strong, unique password.</p>

      <h2>9. Children</h2>
      <p>The Service is not intended for children under 16 and we do not knowingly collect their data.</p>

      <h2>10. Changes</h2>
      <p>We may update this policy and will post the new date above. For material changes we will notify you in the Service.</p>

      <h2>11. Contact</h2>
      <p>Naija Hub — <a href="mailto:privacy@naijahub.app">privacy@naijahub.app</a>.</p>

      <p className="text-xs text-stone-500 mt-8">This document is a general template and has not been reviewed by a lawyer. Have it reviewed by qualified Nigerian counsel, and replace the contact addresses with ones you control, before launch.</p>
    </LegalDoc>
  );
}

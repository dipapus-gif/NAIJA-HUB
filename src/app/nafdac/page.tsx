import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { NafdacChecker } from "@/components/site/NafdacChecker";

export const metadata: Metadata = {
  title: "NAFDAC checker — is this product registered?",
  description: "Check a NAFDAC number's format, pick the product category, and open the official NAFDAC Greenbook to confirm registration.",
};

export default function Page() {
  return (
    <PageShell wide="xl">
      <NafdacChecker />
    </PageShell>
  );
}

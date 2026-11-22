import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { AjoCircles } from "@/components/ajo/AjoCircles";

export const metadata: Metadata = {
  title: "Ajo circles with a central pool — Naija Hub",
  description: "Run an Ajo/Esusu circle with one central pool account: members pay in, the app tracks who has paid and whose turn it is to collect.",
};

export default function AjoPage() {
  return (
    <PageShell wide="xl">
      <AjoCircles />
    </PageShell>
  );
}

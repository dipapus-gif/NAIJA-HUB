import type { Metadata } from "next";
import { HealthHub } from "@/components/health/HealthHub";
import { PageShell } from "@/components/site/PageShell";

export const metadata: Metadata = {
  title: "Health & Emergency — Naija Hub",
  description: "Emergency numbers, road-accident and pregnancy guidance, hospitals in all 36 states and the FCT, and appointment, antenatal and hospital-bed requests.",
};

export default function HealthPage() {
  return (
    <PageShell wide="xl">
      <HealthHub />
    </PageShell>
  );
}

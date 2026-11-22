import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { ToolsHub } from "@/components/tools/ToolsHub";

export const metadata: Metadata = {
  title: "Toolkit — Naija Hub",
  description: "Data budget, debt tracker, shop ledger, savings planner, unit converter, health basics, document checklists, invoices, power planner, developer tools and more.",
};

export default function ToolsPage() {
  return (
    <PageShell wide="xl">
      <ToolsHub />
    </PageShell>
  );
}

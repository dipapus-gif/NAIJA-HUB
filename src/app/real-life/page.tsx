import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { RealLifeBoard } from "@/components/site/RealLifeBoard";

export const metadata: Metadata = {
  title: "Real life — what every Naija Hub tool does for you",
  description: "Every Naija Hub utility and toolkit tool shown in everyday Nigerian life, with a worked naira example for each. All free to use.",
};

export default function RealLifePage() {
  return (
    <PageShell wide="xl">
      <RealLifeBoard />
    </PageShell>
  );
}

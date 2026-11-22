import type { ReactNode } from "react";
import { PageShell } from "./PageShell";

export function LegalDoc({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <PageShell wide>
      <article className="rounded-2xl bg-white text-stone-800 border border-stone-200 p-6 sm:p-10 shadow-xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-lg [&_h2]:text-stone-950 [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-sm [&_ul]:space-y-1 [&_ul]:mb-3 [&_a]:text-emerald-800 [&_a]:underline">
        <h1 className="font-display font-bold text-3xl text-stone-950">{title}</h1>
        <p className="text-xs text-stone-500 mt-1 mb-6">Last updated: {updated}</p>
        {children}
      </article>
    </PageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/PageShell";
import { DATA_INVENTORY, PROCESSORS, type Where } from "@/lib/dataInventory";

export const metadata: Metadata = {
  title: "Data Inventory — Naija Hub",
  description: "Every kind of personal data Naija Hub handles: what, why, where it is stored, who can see it and how long it is kept.",
};

const GROUPS: { key: Where; title: string; blurb: string }[] = [
  { key: "Server", title: "Stored on our servers", blurb: "Data we receive and keep in our database." },
  { key: "Your device", title: "Stays on your device", blurb: "Saved in your browser. We never receive it." },
  { key: "Third party", title: "Seen by other services", blurb: "Data that reaches a provider we use or a service you choose to open." },
];

export default function DataInventoryPage() {
  return (
    <PageShell wide="xl">
      <article className="rounded-2xl bg-white text-stone-800 border border-stone-200 p-6 sm:p-10 shadow-xl">
        <h1 className="font-display font-bold text-3xl text-stone-950">Data Inventory</h1>
        <p className="text-xs text-stone-500 mt-1">Last updated: 22 November 2026 · Read with our <Link href="/privacy" className="text-emerald-800 underline">Privacy Policy</Link></p>
        <p className="text-sm leading-relaxed mt-4">This is the full list of personal data Naija Hub handles, kept in step with the code. For each item you can see why we use it, the lawful basis, where it is stored, who can see it and how long it is kept. Items marked <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full">SENSITIVE</span> include health or financial details.</p>

        <div className="grid sm:grid-cols-3 gap-3 mt-5">
          {GROUPS.map((g) => (
            <div key={g.key} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
              <div className="font-display font-bold text-stone-950 text-sm">{g.title}</div>
              <div className="text-xs text-stone-600">{g.blurb}</div>
              <div className="font-display font-bold text-2xl text-emerald-800 mt-1">{DATA_INVENTORY.filter((d) => d.where === g.key).length}</div>
            </div>
          ))}
        </div>

        {GROUPS.map((g) => (
          <section key={g.key} className="mt-9">
            <h2 className="font-display font-bold text-xl text-stone-950">{g.title}</h2>
            <div className="mt-3 space-y-3">
              {DATA_INVENTORY.filter((d) => d.where === g.key).map((d) => (
                <div key={d.id} className="rounded-xl border border-stone-200 p-4">
                  <h3 className="font-display font-bold text-stone-950 text-base">{d.name} {d.sensitive && <span className="ml-1 text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full align-middle">SENSITIVE</span>}</h3>
                  <dl className="mt-2 grid sm:grid-cols-[9rem_1fr] gap-x-4 gap-y-1.5 text-sm">
                    {([["What", d.data], ["Why", d.purpose], ["Lawful basis", d.basis], ["Stored in", d.storedIn], ["Who can see it", d.access], ["Kept for", d.retention]] as const).map(([k, v]) => (
                      <div key={k} className="contents"><dt className="text-xs font-semibold text-stone-500 sm:pt-0.5">{k}</dt><dd>{v}</dd></div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-9">
          <h2 className="font-display font-bold text-xl text-stone-950">Service providers</h2>
          <ul className="mt-2 text-sm divide-y divide-stone-100">
            {PROCESSORS.map((p) => <li key={p.name} className="py-2"><b>{p.name}</b>: {p.role}. <span className="text-stone-500">{p.region}.</span></li>)}
          </ul>
        </section>

        <section className="mt-9">
          <h2 className="font-display font-bold text-xl text-stone-950">What we do not do</h2>
          <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
            <li>We do not sell personal data or show third-party advertising.</li>
            <li>We do not hold or move money. Ajo circles are a ledger; payments go between members and the organiser’s own bank account.</li>
            <li>We do not send health requests to hospitals.</li>
            <li>We do not use advertising cookies or tracking pixels.</li>
          </ul>
        </section>

        <section className="mt-9">
          <h2 className="font-display font-bold text-xl text-stone-950">Your requests</h2>
          <p className="text-sm mt-2">To see, correct, export or delete anything held about you on our servers, email <a className="text-emerald-800 underline" href="mailto:privacy@naijahub.app">privacy@naijahub.app</a>. Data on your device you can delete yourself by clearing this site’s data in your browser settings.</p>
        </section>

        <p className="text-xs text-stone-500 mt-8">This inventory is an operational record, not legal advice. Have a Nigerian data-protection professional review it, confirm whether you must register with the Nigeria Data Protection Commission, and replace the placeholder contact address with one you control. Automatic deletion schedules are not yet built; retention lines say so where that applies.</p>
      </article>
    </PageShell>
  );
}

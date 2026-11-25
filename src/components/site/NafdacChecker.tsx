"use client";

import { useState } from "react";
import { ExternalLink, ShieldCheck, Flag } from "lucide-react";

const GREENBOOK = "https://greenbook.nafdac.gov.ng";
const NAFDAC = "https://nafdac.gov.ng";

// Categories as listed on the official Greenbook, plus non-drug products (food, cosmetics, water),
// which NAFDAC keeps in a separate "Registered Products (non drug) Database".
const CATS = [
  { id: "drugs", name: "Drugs (medicine)", where: "greenbook", tip: "Search by product name, active ingredient or NRN. Check the form (tablet, syrup), strength and company match the pack." },
  { id: "vax", name: "Vaccines & biologics", where: "greenbook", tip: "Vaccines should come from a clinic or licensed pharmacy that keeps a cold chain, not from street sellers." },
  { id: "devices", name: "Medical devices", where: "greenbook", tip: "Check the device name, manufacturer and that the status is still active." },
  { id: "vet", name: "Veterinary", where: "greenbook", tip: "For animal medicine and feed additives. Compare the applicant name on the pack with the listing." },
  { id: "herbal", name: "Herbals & nutraceuticals", where: "greenbook", tip: "Many herbal packs carry a number. Confirm it exists and matches this exact product name." },
  { id: "disinf", name: "Disinfectants", where: "greenbook", tip: "Check the product name and company against the listing." },
  { id: "food", name: "Food, drinks, cosmetics & water", where: "nafdac", tip: "These are non-drug products. Use NAFDAC's non-drug registered products database from the NAFDAC site." },
] as const;

// Loose format check only: NAFDAC numbers are letters/digits, a dash, then digits (for example A4-1234 or 04-1234).
// A passing format does NOT mean the product is registered.
function formatNote(v: string): { ok: boolean; msg: string } | null {
  const s = v.trim().toUpperCase();
  if (!s) return null;
  if (/^[A-Z0-9]{1,3}-?\d{3,6}$/.test(s)) return { ok: true, msg: "The format looks like a NAFDAC number. That only means it is shaped right. Confirm it in the official database below." };
  return { ok: false, msg: "This doesn't look like a typical NAFDAC number (for example A4-1234). Re-read the pack, or treat the missing number as a warning." };
}

export function NafdacChecker() {
  const [cat, setCat] = useState<(typeof CATS)[number]["id"]>("drugs");
  const [nrn, setNrn] = useState("");
  const c = CATS.find((x) => x.id === cat)!;
  const note = formatNote(nrn);
  const url = c.where === "greenbook" ? GREENBOOK : NAFDAC;
  const chip = (on: boolean) =>
    `shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition ${on ? "bg-amber-400 text-stone-950 border-amber-400" : "border-emerald-800 text-emerald-100 hover:border-amber-400"}`;

  async function open() {
    try { if (nrn.trim()) await navigator.clipboard.writeText(nrn.trim()); } catch {}
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[11px] tracking-[0.2em] text-amber-300 font-semibold">NAFDAC CHECKER</p>
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mt-1">Is this product registered?</h1>
      <p className="text-sm text-emerald-100/80 mt-2">
        Pick the kind of product, type the NAFDAC number from the pack, then confirm it in NAFDAC&apos;s own database. Naija Hub does not keep a copy of the list, so you always see NAFDAC&apos;s current record.
      </p>

      <div className="flex gap-2 overflow-x-auto py-4" role="group" aria-label="Product category">
        {CATS.map((x) => <button key={x.id} type="button" className={chip(cat === x.id)} onClick={() => setCat(x.id)}>{x.name}</button>)}
      </div>

      <label className="block text-xs font-bold text-emerald-200" htmlFor="nrn">NAFDAC number on the pack</label>
      <input id="nrn" value={nrn} onChange={(e) => setNrn(e.target.value)} placeholder="e.g. A4-1234" autoCapitalize="characters" autoComplete="off"
        className="mt-1 w-full rounded-xl bg-[#08201a] border border-emerald-800 px-4 py-3 text-white outline-none focus:border-amber-400" />
      {note && (
        <p className={`mt-2 text-sm ${note.ok ? "text-emerald-200" : "text-amber-300"}`}>{note.msg}</p>
      )}

      <div className="mt-4 rounded-2xl border border-emerald-900/70 bg-[#08201a] p-4">
        <p className="text-sm text-emerald-100/90">{c.tip}</p>
        <button type="button" onClick={open} className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-400 text-stone-950 font-bold text-sm px-5 py-2.5 cursor-pointer">
          <ShieldCheck className="w-4 h-4" /> {c.where === "greenbook" ? "Check in the official Greenbook" : "Open the NAFDAC site"} <ExternalLink className="w-3.5 h-3.5" />
        </button>
        {nrn.trim() && <p className="text-[11px] text-emerald-200/60 mt-2">Your number is copied. Paste it into the search box.</p>}
      </div>

      <h2 className="font-display font-bold text-lg text-white mt-8">On the pack, look for</h2>
      <ul className="mt-2 space-y-1.5 text-sm text-emerald-100/90 list-disc pl-5">
        <li>A NAFDAC number that is printed clearly, not stuck on or smudged.</li>
        <li>The product name, strength and company in the database matching what you hold.</li>
        <li>A status that is still registered, and an expiry date that has not passed.</li>
        <li>A seal that is intact, clean printing and spelling, and a licensed seller.</li>
      </ul>

      <div className="mt-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm">
        <p className="flex items-center gap-2 font-bold text-amber-300"><Flag className="w-4 h-4" /> Think it is fake or harmful?</p>
        <p className="text-emerald-50/90 mt-1">Stop using it. The Greenbook has &ldquo;Report SF&rdquo; (substandard and falsified products) and &ldquo;Report ADR&rdquo; (bad reactions) forms. For a medicine problem, speak to a pharmacist or doctor.</p>
      </div>

      <p className="text-xs text-emerald-200/60 mt-6">
        This tool does not say a product is genuine or safe. Only NAFDAC&apos;s own records can. Source: <a className="underline" href={GREENBOOK} target="_blank" rel="noopener noreferrer">NAFDAC Greenbook</a>. Not affiliated with NAFDAC.
      </p>
    </div>
  );
}

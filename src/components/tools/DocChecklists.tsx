"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, Note, useLocal } from "./kit";

interface Doc { key: string; title: string; office: string; url: string; fee: string; items: string[] }

const DOCS: Doc[] = [
  { key: "nin", title: "NIN (National Identification Number)", office: "NIMC enrolment centre or NIMC-accredited enrolment partner", url: "https://nimc.gov.ng", fee: "Enrolment is free at NIMC; NIMC has warned partners against charging for it. Replacement/modification services may carry a fee: confirm with NIMC.",
    items: ["Be present in person (fingerprints, photo and signature are captured)", "Valid ID if you have one (e.g. voter's card, driver's licence, international passport)", "Birth certificate or declaration of age", "Active phone number (the one you will keep)", "Proof of address or an attestation if you do not have an ID"] },
  { key: "passport", title: "International passport", office: "Nigeria Immigration Service (NIS) passport office; apply on the NIS portal first", url: "https://immigration.gov.ng", fee: "Reported fees from 1 Sep 2025: ₦100,000 (32 pages, 5 years) and ₦200,000 (64 pages, 10 years). Confirm the current fee on the NIS portal before paying.",
    items: ["NIN (slip or number)", "Birth certificate or declaration of age", "Evidence of state of origin (e.g. local government letter)", "Guarantor form completed as the portal requires", "Passport-size photographs if requested at your office", "Payment receipt from the official portal only", "Old passport (for renewal) or marriage certificate / affidavit (for name change)"] },
  { key: "dl", title: "Driver's licence", office: "FRSC licensing office", url: "https://frsc.gov.ng", fee: "Fees depend on the licence class and validity period. Confirm the current schedule at frsc.gov.ng or your FRSC office.",
    items: ["NIN", "Completed online application and payment receipt", "Passport photograph (as required)", "Proof of address if asked", "Be ready for capture and, for a first licence, the required driving test and training", "For renewal: your old licence"] },
  { key: "cac", title: "CAC business registration", office: "Corporate Affairs Commission (online portal) or an accredited agent", url: "https://www.cac.gov.ng", fee: "Depends on business type and share capital. Confirm on the CAC portal; avoid agents who quote fees you cannot verify.",
    items: ["Two or three proposed business names (for name availability check)", "NIN of each proprietor / director / shareholder", "Valid ID and passport photograph of each", "Business address and objects of the business", "Active email and phone number", "Signatures and, for companies, share capital details and memorandum"] },
  { key: "jamb", title: "JAMB (UTME / Direct Entry)", office: "JAMB-accredited CBT centre; register through the JAMB portal", url: "https://www.jamb.gov.ng", fee: "Fees are set by JAMB each year. Confirm on jamb.gov.ng and pay only through official channels.",
    items: ["NIN (required for registration)", "Active email address and the phone number linked to your NIN", "O'level result details (or expected exam information)", "Passport photograph", "Choice of institution and course", "Payment receipt and registration slip: keep both"] },
];

export default function DocChecklists() {
  const [open, setOpen] = useState("nin");
  const [done, setDone] = useLocal<Record<string, boolean>>("nh_doc_checks", {});
  return (
    <div className="space-y-4">
      {DOCS.map((d) => {
        const n = d.items.filter((_, i) => done[`${d.key}:${i}`]).length;
        const isOpen = open === d.key;
        return (
          <Card key={d.key}>
            <button className="w-full text-left flex justify-between items-center gap-3 cursor-pointer" onClick={() => setOpen(isOpen ? "" : d.key)} aria-expanded={isOpen}>
              <span className="font-display font-bold text-stone-950">{d.title}</span>
              <span className="text-xs text-stone-500 shrink-0">{n}/{d.items.length} ready</span>
            </button>
            {isOpen && (
              <div className="mt-3">
                <ul className="space-y-2 text-sm">
                  {d.items.map((it, i) => (
                    <li key={it}>
                      <label className="flex gap-2.5 items-start cursor-pointer">
                        <input type="checkbox" className="mt-1 accent-emerald-700" checked={!!done[`${d.key}:${i}`]} onChange={(e) => setDone({ ...done, [`${d.key}:${i}`]: e.target.checked })} />
                        <span className={done[`${d.key}:${i}`] ? "line-through text-stone-400" : ""}>{it}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-xs space-y-1.5 text-stone-700">
                  <p><b>Where:</b> {d.office}</p>
                  <p><b>Fee:</b> {d.fee}</p>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-800 underline font-semibold">Official site <ExternalLink className="w-3 h-3" /></a>
                </div>
              </div>
            )}
          </Card>
        );
      })}
      <Note>Lists show what is commonly required. Rules and fees change, and offices can ask for more, so confirm on the official site before you travel or pay. Never pay anyone who is not on the official portal.</Note>
    </div>
  );
}

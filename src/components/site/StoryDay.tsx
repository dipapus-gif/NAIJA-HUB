"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { pick, type Lang } from "@/lib/i18n";

interface Scene { time: string; who: string; place: string; title: string; body: string; links: { href: string; label: string }[] }

const SCENES: Scene[] = [
  { time: "05:59", who: "Mama Ngozi, fruit trader", place: "Mile 12, Lagos", title: "Before the first customer", body: "She checks if light is on at the shop, sees today's petrol price before she fuels the generator, and opens the shop ledger to start the day's sales with ₦0.", links: [{ href: "/tools#shop", label: "Shop ledger" }, { href: "/#utilities", label: "Light & fuel" }] },
  { time: "08:30", who: "Tunde, freelance developer", place: "Yaba, Lagos", title: "Paid in dollars, living in naira", body: "A client in London pays $450. Tunde logs the fee, the rate he got and what is left, then sends the next invoice as a PDF on WhatsApp. His power planner tells him what solar and battery would replace the generator.", links: [{ href: "/tools#usd", label: "Dollar tracker" }, { href: "/tools#invoice", label: "Invoice maker" }, { href: "/tools#power", label: "Power planner" }] },
  { time: "10:15", who: "Hauwa, expectant mother", place: "Kano", title: "The antenatal visit, planned", body: "She finds the teaching hospital in her state, notes her due date, and records an antenatal request so she has a reference to quote when she calls. A road-accident card and 112 are one tap away.", links: [{ href: "/health", label: "Health & Emergency" }, { href: "/tools#health", label: "Health basics" }] },
  { time: "13:00", who: "Chidi, JAMB candidate", place: "Enugu", title: "Right papers, no fake links", body: "He ticks off what to carry for NIN and JAMB, then pastes a link a stranger sent into the phishing checker before he types anything into it.", links: [{ href: "/tools#docs", label: "Document checklists" }, { href: "/tools#phish", label: "Link checker" }] },
  { time: "17:30", who: "The Yaba Circle, 12 friends", place: "Everywhere", title: "Ajo with one pool", body: "Everyone pays into the central pool account. The organiser confirms each payment, and the app unlocks the payout for whoever's turn it is, only when all 12 have paid.", links: [{ href: "/ajo", label: "Ajo circles" }] },
  { time: "21:00", who: "Baba Seun, shop owner", place: "Ibadan", title: "Who owes, what's due, how long until term", body: "He sends polite WhatsApp reminders to two customers, sees ₦38,000 left to save before term starts in 19 days, and sets a phone alarm for the generator service.", links: [{ href: "/tools#debts", label: "Debt tracker" }, { href: "/tools#savings", label: "School fees planner" }] },
];

function Reveal({ children, i }: { children: React.ReactNode; i: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setOn(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <li ref={ref} className={`relative pl-10 sm:pl-14 pb-10 last:pb-0 transition-all duration-700 ease-out ${on ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${(i % 2) * 60}ms` }}>
      {children}
    </li>
  );
}

export function StoryDay({ lang }: { lang: Lang }) {
  return (
    <section id="a-day" className="py-16 sm:py-24 border-y border-emerald-900/70 bg-[#061A14]" style={{ contentVisibility: "auto", containIntrinsicSize: "1px 1400px" }}>
      <div className="max-w-3xl mx-auto px-5">
        <p className="font-mono text-[11px] tracking-[0.25em] text-amber-300">{pick(lang, "A DAY IN NAIJA", "ONE DAY FOR NAIJA", "ỌJỌ́ KAN NÍ NAIJA", "RANA ƊAYA A NAJERIYA", "ỤBỌCHỊ OTU NA NAỊJIRỊA")}</p>
        <h2 className="font-serif text-4xl sm:text-6xl text-white leading-[1.02] mt-3 uppercase">{pick(lang, "Six people. One phone each.", "Six people. One phone each.", "Ènìyàn mẹ́fà. Fóònù kọ̀ọ̀kan.", "Mutane shida. Waya ɗaya kowanne.", "Mmadụ isii. Ekwentị otu nke ọ bụla.")}</h2>
        <p className="mt-4 text-emerald-100/80 text-sm sm:text-base max-w-xl">{pick(lang, "Follow a day in the life, from the first light check to the evening Ajo. The people are made up; the problems are real.", "Follow one day from morning light check reach night Ajo. Di people na story, but the wahala na real.", undefined, undefined, undefined)}</p>
        <ol className="relative mt-12">
          <span aria-hidden className="absolute left-[11px] sm:left-[17px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-300/70 via-emerald-600/50 to-transparent" />
          {SCENES.map((s, i) => (
            <Reveal key={s.time} i={i}>
              <span aria-hidden className="absolute left-0 sm:left-1.5 top-1.5 w-6 h-6 rounded-full bg-[#061A14] border-2 border-amber-300 flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-full bg-amber-300" /></span>
              <div className="font-mono text-xs text-amber-300 tracking-widest">{s.time} · {s.place}</div>
              <h3 className="font-serif text-2xl sm:text-3xl text-white mt-1">{s.title}</h3>
              <p className="text-xs text-emerald-200/70 mt-0.5">{s.who}</p>
              <p className="text-sm text-emerald-50/85 leading-relaxed mt-2">{s.body}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {s.links.map((l) => (
                  <Link key={l.href + l.label} href={l.href} className="text-[11px] font-semibold tracking-wide px-3 py-1.5 border border-emerald-600/60 text-emerald-100 hover:bg-amber-400 hover:text-stone-950 hover:border-amber-400 transition">{l.label} →</Link>
                ))}
              </div>
            </Reveal>
          ))}
        </ol>
        <p className="text-[11px] text-emerald-200/50 mt-8">Characters and amounts are illustrative, not real people.</p>
      </div>
    </section>
  );
}

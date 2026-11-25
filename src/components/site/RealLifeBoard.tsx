"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";
import { GROUPS, REAL_LIFE, type Group } from "@/lib/realLife";

export function RealLifeBoard() {
  const [g, setG] = useState<Group | "All">("All");
  const list = REAL_LIFE.filter((r) => g === "All" || r.group === g);
  const chip = (on: boolean) =>
    `shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition ${on ? "bg-amber-400 text-stone-950 border-amber-400" : "border-emerald-800 text-emerald-100 hover:border-amber-400"}`;

  return (
    <div>
      <p className="text-[11px] tracking-[0.2em] text-amber-300 font-semibold">REAL LIFE</p>
      <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mt-1">Every tool, in your everyday life</h1>
      <p className="text-sm sm:text-base text-emerald-100/80 mt-2 max-w-2xl">
        {REAL_LIFE.length} tools, each shown the way people actually use it, with a worked naira example so you can see what it is worth to you. Every tool is free to use today.
      </p>

      <div className="flex gap-2 overflow-x-auto py-4 -mx-1 px-1" role="group" aria-label="Filter by group">
        <button type="button" className={chip(g === "All")} onClick={() => setG("All")}>All</button>
        {GROUPS.map((x) => <button key={x} type="button" className={chip(g === x)} onClick={() => setG(x)}>{x}</button>)}
      </div>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((r) => (
          <li key={r.id} className="rounded-2xl border border-emerald-900/70 bg-[#08201a] p-4 sm:p-5 flex flex-col">
            <span className="text-[10px] tracking-[0.18em] text-amber-300 font-semibold uppercase">{r.group}</span>
            <h2 className="font-display font-bold text-lg text-white mt-1">{r.name}</h2>
            <p className="text-xs text-emerald-200/70 mt-0.5">{r.who}</p>
            <p className="text-sm text-emerald-100/90 mt-3 leading-relaxed">{r.story}</p>
            <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 tracking-wide"><Calculator className="w-3.5 h-3.5" /> DO THE MATHS</p>
              <p className="text-emerald-50/90 mt-1">{r.maths}</p>
              <p className="font-display font-bold text-amber-200 mt-1">{r.result}</p>
            </div>
            <Link href={r.href} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-100 hover:text-amber-300 self-start">
              Try it <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-xs text-emerald-200/60 mt-8 max-w-2xl">
        The people are fictional. Every naira figure is an example worked out on the card so you can check the arithmetic. It is not today&apos;s market price and not a promise of savings. Put your own numbers into each tool.
      </p>
    </div>
  );
}

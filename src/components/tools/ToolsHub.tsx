"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentType } from "react";
import { ArrowLeft, BadgeDollarSign, Banknote, BriefcaseBusiness, CalendarDays, ClipboardList, Code2, FileCheck2, HeartPulse, Languages, Link2, PiggyBank, Receipt, Ruler, ShieldAlert, Smartphone, Store, Wrench, Zap, Activity } from "lucide-react";

const Loading = () => <div className="rounded-2xl bg-emerald-950/60 border border-emerald-800 p-8 text-center text-sm text-emerald-100/70">Loading…</div>;
const load = (f: () => Promise<{ default: ComponentType }>) => dynamic(f, { ssr: false, loading: Loading });

interface Tool { id: string; name: string; blurb: string; icon: React.ReactNode; C: ComponentType }

const COMMON: Tool[] = [
  { id: "data", name: "Data & airtime budget", blurb: "Log recharges, see your costliest month and network.", icon: <Smartphone className="w-5 h-5" />, C: load(() => import("./DataBudget")) },
  { id: "debts", name: "Debt & loan tracker", blurb: "Who owes you, who you owe, with reminders.", icon: <Banknote className="w-5 h-5" />, C: load(() => import("./DebtTracker")) },
  { id: "shop", name: "Shop ledger & stock", blurb: "Daily sales, expenses and profit. No signup.", icon: <Store className="w-5 h-5" />, C: load(() => import("./ShopLedger")) },
  { id: "savings", name: "Savings & school fees", blurb: "Monthly target and a term-start countdown.", icon: <PiggyBank className="w-5 h-5" />, C: load(() => import("./SavingsPlanner")) },
  { id: "units", name: "Units & measures", blurb: "Plots, acres, kg, litres, and your own derica.", icon: <Ruler className="w-5 h-5" />, C: load(() => import("./UnitsConverter")) },
  { id: "health", name: "Health basics", blurb: "Fever first-aid, child vaccines, clinics, medicine alarms.", icon: <HeartPulse className="w-5 h-5" />, C: load(() => import("./HealthBasics")) },
  { id: "docs", name: "Document checklists", blurb: "NIN, passport, licence, CAC and JAMB.", icon: <FileCheck2 className="w-5 h-5" />, C: load(() => import("./DocChecklists")) },
  { id: "holidays", name: "Holidays & travel", blurb: "Public holidays, Sallah and Christmas planning.", icon: <CalendarDays className="w-5 h-5" />, C: load(() => import("./HolidayCalendar")) },
  { id: "phrases", name: "Phrasebook with voice", blurb: "Pidgin, Yorùbá, Hausa and Igbo phrases, spoken.", icon: <Languages className="w-5 h-5" />, C: load(() => import("./Phrasebook")) },
];
const TECH: Tool[] = [
  { id: "invoice", name: "Invoice maker", blurb: "PDF invoice in ₦ or $, share on WhatsApp.", icon: <Receipt className="w-5 h-5" />, C: load(() => import("./InvoiceMaker")) },
  { id: "usd", name: "Dollar income tracker", blurb: "Earnings at your rate, minus fees.", icon: <BadgeDollarSign className="w-5 h-5" />, C: load(() => import("./DollarTracker")) },
  { id: "power", name: "Power planner", blurb: "Size an inverter, battery, solar or generator.", icon: <Zap className="w-5 h-5" />, C: load(() => import("./PowerPlanner")) },
  { id: "dev", name: "Developer toolbox", blurb: "JSON, Base64, regex, UUID, timestamps. Offline.", icon: <Code2 className="w-5 h-5" />, C: load(() => import("./DevToolbox")) },
  { id: "qr", name: "Link & QR generator", blurb: "WhatsApp click-to-chat and payment-details QR.", icon: <Link2 className="w-5 h-5" />, C: load(() => import("./LinkQr")) },
  { id: "phish", name: "Phishing & URL checker", blurb: "Spot look-alike bank links with simple rules.", icon: <ShieldAlert className="w-5 h-5" />, C: load(() => import("./PhishingChecker")) },
  { id: "jobs", name: "Job & gig tracker", blurb: "Applications, interviews and follow-ups.", icon: <BriefcaseBusiness className="w-5 h-5" />, C: load(() => import("./JobTracker")) },
  { id: "api", name: "Mock API & status checker", blurb: "Design mock endpoints, ping your services.", icon: <Activity className="w-5 h-5" />, C: load(() => import("./ApiChecker")) },
];
const ALL = [...COMMON, ...TECH];

function Grid({ title, tools, onPick }: { title: string; tools: Tool[]; onPick: (id: string) => void }) {
  return (
    <section className="mb-8">
      <h2 className="font-display font-bold text-lg text-white mb-3">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((t) => (
          <button key={t.id} onClick={() => onPick(t.id)} className="text-left rounded-2xl border border-emerald-800 bg-emerald-950/50 hover:border-amber-400 p-4 transition cursor-pointer">
            <span className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center mb-2">{t.icon}</span>
            <div className="font-display font-bold text-white text-sm">{t.name}</div>
            <div className="text-xs text-emerald-100/70 mt-0.5">{t.blurb}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ToolsHub() {
  const [id, setId] = useState("");
  useEffect(() => {
    const h = window.location.hash.slice(1);
    if (ALL.some((t) => t.id === h)) setId(h);
  }, []);
  const pick = (v: string) => {
    setId(v);
    history.replaceState(null, "", v ? `#${v}` : window.location.pathname);
    window.scrollTo({ top: 0 });
  };
  const tool = ALL.find((t) => t.id === id);

  if (tool) {
    const C = tool.C;
    return (
      <div>
        <button onClick={() => pick("")} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-100 hover:text-amber-300 mb-4 cursor-pointer"><ArrowLeft className="w-3.5 h-3.5" /> All tools</button>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-5">{tool.name}</h1>
        <C />
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-white flex items-center gap-2"><Wrench className="w-7 h-7 text-amber-300" /> Toolkit</h1>
      <p className="text-sm text-emerald-100/80 mt-1 mb-6">Seventeen everyday tools. They work without an account, keep your records on this device, and most work offline.</p>
      <Grid title="For everyday life" tools={COMMON} onPick={pick} />
      <Grid title="For the tech world" tools={TECH} onPick={pick} />
      <p className="text-[11px] text-emerald-100/50"><ClipboardList className="inline w-3 h-3 mr-1" />Your records are stored in this browser. Clearing site data deletes them; export where a tool offers it.</p>
    </div>
  );
}

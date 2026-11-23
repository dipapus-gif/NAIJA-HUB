"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, HeartPulse, Menu, Search, Users, Wrench, X } from "lucide-react";
import { COPY, pick } from "@/lib/i18n";
import { TOOL_LIST, UTILITY_KEYS } from "@/lib/siteMap";
import { useLang } from "@/lib/useLang";

interface Props { onJumpUtility?: (key: string) => void }
interface Act { label: string; href: string }

const lsJson = <T,>(k: string, d: T): T => {
  try {
    return JSON.parse(window.localStorage.getItem(k) || "") as T;
  } catch {
    return d;
  }
};

function readActivity(): Act[] {
  const out: Act[] = [];
  const t = new Date().toISOString().slice(0, 10);
  const debts = lsJson<{ paid: boolean }[]>("nh_debts", []).filter((d) => !d.paid).length;
  if (debts) out.push({ label: `${debts} open debt${debts > 1 ? "s" : ""}`, href: "/tools#debts" });
  const shop = lsJson<{ date: string }[]>("nh_shop_entries", []).filter((e) => e.date === t).length;
  if (shop) out.push({ label: `${shop} shop entr${shop > 1 ? "ies" : "y"} today`, href: "/tools#shop" });
  const recharges = lsJson<unknown[]>("nh_data_budget", []).length;
  if (recharges) out.push({ label: `${recharges} recharge${recharges > 1 ? "s" : ""} logged`, href: "/tools#data" });
  const jobs = lsJson<unknown[]>("nh_jobs", []).length;
  if (jobs) out.push({ label: `${jobs} job application${jobs > 1 ? "s" : ""}`, href: "/tools#jobs" });
  const pays = lsJson<unknown[]>("nh_usd_income", []).length;
  if (pays) out.push({ label: `${pays} dollar payment${pays > 1 ? "s" : ""} tracked`, href: "/tools#usd" });
  const meds = lsJson<unknown[]>("nh_meds", []).length;
  if (meds) out.push({ label: `${meds} medicine reminder${meds > 1 ? "s" : ""}`, href: "/tools#health" });
  const reqs = lsJson<{ ref: string; type: string }[]>("naija_hub_health_requests", []);
  reqs.slice(0, 3).forEach((r) => out.push({ label: `Health request ${r.ref}`, href: "/health" }));
  return out;
}

export function SideMenu({ onJumpUtility }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [lang] = useLang();
  const [acts, setActs] = useState<Act[]>([]);
  const [circles, setCircles] = useState<Act[]>([]);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const t = COPY[lang].utilities;

  useEffect(() => {
    if (!open) return;
    setActs(readActivity());
    fetch("/api/ajo", { cache: "no-store" })
      .then(async (r) => {
        setSignedIn(r.status !== 401);
        if (!r.ok) return;
        const j = await r.json();
        setCircles((j.circles ?? []).map((c: { id: number; name: string; round: number; members: number | string }) => ({ label: `Ajo: ${c.name}`, href: "/ajo" })));
      })
      .catch(() => setSignedIn(null));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const match = (s: string) => !q.trim() || s.toLowerCase().includes(q.trim().toLowerCase());
  const utilities = useMemo(() => UTILITY_KEYS.map((k) => ({ k, name: t[k].name })).filter((u) => match(u.name)), [t, q]); // eslint-disable-line react-hooks/exhaustive-deps
  const tools = TOOL_LIST.filter((x) => match(x.name));
  const L = (en: string, pcm: string, yo: string, ha: string, ig: string) => pick(lang, en, pcm, yo, ha, ig);

  const item = "block px-3 py-2 rounded-lg text-sm text-emerald-50 hover:bg-emerald-800/60 hover:text-amber-300";
  const head = "px-3 pt-4 pb-1 text-[10px] font-bold tracking-[0.2em] text-amber-300 flex items-center gap-1.5";
  const go = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={L("Open menu", "Open menu", "Ṣí àtòkọ", "Buɗe menu", "Mepee menu")}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] flex items-center gap-1.5 pl-2 pr-3 py-3 rounded-r-2xl bg-amber-400 text-stone-950 shadow-lg hover:bg-amber-300 cursor-pointer"
      >
        <Menu className="w-5 h-5" />
        <span className="hidden sm:inline text-xs font-bold">{L("Menu", "Menu", "Àtòkọ", "Menu", "Menu")}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Site menu">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/60 cursor-default" onClick={go} />
          <aside className="absolute left-0 top-0 bottom-0 w-[86%] max-w-sm bg-[#061A14] border-r border-emerald-800 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 h-14 border-b border-emerald-900 shrink-0">
              <span className="font-display font-bold text-white">Naija Hub</span>
              <button aria-label="Close" onClick={go} className="p-1.5 text-emerald-100 hover:text-amber-300 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-4 py-3 border-b border-emerald-900 shrink-0">
              <label className="flex items-center gap-2 rounded-xl bg-emerald-950 border border-emerald-800 px-3 py-2">
                <Search className="w-4 h-4 text-emerald-300" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L("Search tools and pages", "Search tools and pages", "Wá irinṣẹ́ àti ojú-ewé", "Nemo kayan aiki da shafuka", "Chọọ ngwa na peeji")} className="bg-transparent outline-none text-sm text-white placeholder:text-emerald-300/50 w-full" />
              </label>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 pb-6">
              {!q && (
                <>
                  <div className={head}><Activity className="w-3.5 h-3.5" />{L("MY ACTIVITY", "WETIN I DO", "ÌṢẸ́ MI", "ABIN DA NA YI", "ỌRỤ M")}</div>
                  {acts.length === 0 && circles.length === 0 ? (
                    <p className="px-3 py-1 text-xs text-emerald-200/60">{L("Nothing yet. Records you save in the tools show up here.", "Nothing yet. Wetin you save for tools go show here.", "Kò sí ohun kankan síbẹ̀. Àwọn àkọsílẹ̀ rẹ yóò hàn níbí.", "Babu komai tukuna. Abubuwan da ka adana za su bayyana a nan.", "Ọ dịghị ihe ugbu a. Ndekọ ị chekwara ga-apụta ebe a.")}</p>
                  ) : (
                    [...circles, ...acts].map((a) => <Link key={a.label} href={a.href} onClick={go} className={item}>{a.label}</Link>)
                  )}
                  <div className={head}>{L("GO TO", "GO TO", "LỌ SÍ", "JE ZUWA", "GAA")}</div>
                  <a href="/#top" onClick={go} className={item}>{L("Home", "Home", "Ilé", "Gida", "Ụlọ")}</a>
                  <a href="/#motion" onClick={go} className={item}>{L("The story (scroll film)", "Di story (scroll film)", "Ìtàn náà", "Labarin", "Akụkọ ahụ")}</a>
                  <a href="/#a-day" onClick={go} className={item}>{L("A day in Naija", "One day for Naija", "Ọjọ́ kan ní Naija", "Rana ɗaya a Najeriya", "Ụbọchị otu na Naịjirịa")}</a>
                </>
              )}

              {utilities.length > 0 && <div className={head}>{L("10 UTILITIES", "10 TOOLS", "IRINṢẸ́ MẸ́WÀÁ", "KAYAN AIKI 10", "NGWA IRI")}</div>}
              {utilities.map((u) =>
                onJumpUtility ? (
                  <button key={u.k} type="button" onClick={() => { onJumpUtility(u.k); go(); }} className={`${item} w-full text-left cursor-pointer`}>{u.name}</button>
                ) : (
                  <a key={u.k} href={`/?u=${u.k}`} onClick={go} className={item}>{u.name}</a>
                ),
              )}

              {tools.length > 0 && <div className={head}><Wrench className="w-3.5 h-3.5" />{L("TOOLKIT (17)", "TOOLKIT (17)", "ÀPÓTÍ IRINṢẸ́ (17)", "AKWATIN KAYAN AIKI (17)", "IGBE NGWA (17)")}</div>}
              {tools.map((x) => <Link key={x.id} href={`/tools#${x.id}`} onClick={go} className={item}>{x.name}</Link>)}

              {!q && (
                <>
                  <div className={head}><HeartPulse className="w-3.5 h-3.5" />{L("HEALTH & MONEY", "HOSPITAL & MONEY", "ÌLERA ÀTI OWÓ", "LAFIYA DA KUƊI", "AHỤIKE NA EGO")}</div>
                  <Link href="/health" onClick={go} className={item}>{L("Health & Emergency", "Hospital & Emergency", "Ìlera àti pàjáwìrì", "Lafiya da gaggawa", "Ahụike na ihe mberede")}</Link>
                  <a href="tel:112" className={`${item} text-rose-300`}>{L("Call 112 (emergency)", "Call 112 (emergency)", "Pe 112 (pàjáwìrì)", "Kira 112 (gaggawa)", "Kpọọ 112 (mberede)")}</a>
                  <Link href="/ajo" onClick={go} className={item}><Users className="inline w-4 h-4 mr-1.5 -mt-0.5" />{L("Ajo circles (central pool)", "Ajo circles (one pool)", "Àjọ (àpò àárín)", "Ajo (asusun tsakiya)", "Ajo (ọdọ ego etiti)")}</Link>
                  <div className={head}>{L("ACCOUNT", "ACCOUNT", "ÀKÀÚNTÌ", "ASUSU", "AKAỤNTỤ")}</div>
                  {signedIn ? (
                    <Link href="/" onClick={go} className={item}>{L("You are signed in", "You don sign in", "O ti wọlé", "Ka shiga", "Ị banyela")}</Link>
                  ) : (
                    <>
                      <Link href="/login" onClick={go} className={item}>{L("Sign in", "Sign in", "Wọlé", "Shiga", "Banye")}</Link>
                      <Link href="/register" onClick={go} className={item}>{L("Create free account", "Open free account", "Ṣí àkàúntì ọfẹ́", "Buɗe asusu kyauta", "Mepee akaụntụ n'efu")}</Link>
                    </>
                  )}
                  <div className={head}>{L("LEGAL", "LEGAL", "ÒFIN", "DOKA", "iwu")}</div>
                  <Link href="/terms" onClick={go} className={item}>Terms of Service</Link>
                  <Link href="/privacy" onClick={go} className={item}>Privacy Policy</Link>
                  <Link href="/data-inventory" onClick={go} className={item}>Data Inventory</Link>
                </>
              )}
              {q && utilities.length === 0 && tools.length === 0 && <p className="px-3 py-4 text-sm text-emerald-200/70">No match.</p>}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

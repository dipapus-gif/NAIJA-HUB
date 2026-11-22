"use client";

import { useEffect, useState, type ReactNode } from "react";

/** localStorage-backed state that is safe for SSR/hydration and private-mode browsers. */
export function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* unavailable or corrupt: keep initial */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked */
    }
  }, [key, value, ready]);
  return [value, setValue, ready] as const;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const today = () => new Date().toISOString().slice(0, 10);
export const monthKey = (d: string) => d.slice(0, 7);

export const naira = (n: number) => "₦" + (Number.isFinite(n) ? Math.round(n) : 0).toLocaleString("en-NG");
export const usd = (n: number) => "$" + (Number.isFinite(n) ? n : 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const num = (s: string | number) => {
  const n = typeof s === "number" ? s : parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const inputCls =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 placeholder:text-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";
export const btnCls =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 text-stone-950 text-xs font-bold px-4 py-2.5 hover:bg-amber-300 transition cursor-pointer disabled:opacity-50";
export const ghostBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 text-stone-800 text-xs font-semibold px-3 py-2 hover:border-emerald-700 transition cursor-pointer";

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white text-stone-900 border border-stone-200 p-4 sm:p-5 shadow-lg ${className}`}>
      {title && <h3 className="font-display font-bold text-base text-stone-950 mb-3">{title}</h3>}
      {children}
    </section>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-xs font-semibold text-stone-700">
      {label}
      <div className="mt-1">{children}</div>
      {hint && <span className="block mt-1 text-[11px] font-normal text-stone-500">{hint}</span>}
    </label>
  );
}

export function Stat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "bad" }) {
  const c = tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-rose-700" : "text-stone-950";
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">{label}</div>
      <div className={`font-display font-bold text-lg ${c}`}>{value}</div>
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-[11px] text-stone-500 mt-3 leading-relaxed">{children}</p>;
}

/** Downloads a real calendar reminder (.ics) so alerts work even when the app is closed. */
export function downloadIcs(title: string, date: string, notes = "") {
  const d = date.replace(/-/g, "");
  const esc = (s: string) => s.replace(/[\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Naija Hub//EN",
    "BEGIN:VEVENT",
    `UID:${uid()}@naijahub`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${d}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(notes)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  a.download = "naija-hub-reminder.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function daysUntil(date: string) {
  const t = new Date(date + "T00:00:00").getTime();
  const n = new Date(today() + "T00:00:00").getTime();
  return Math.round((t - n) / 86400000);
}

export function waLink(text: string, phone?: string) {
  const p = phone ? phone.replace(/\D/g, "") : "";
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}

export function toCsv(rows: (string | number)[][]) {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}
export function downloadText(name: string, text: string, type = "text/csv") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

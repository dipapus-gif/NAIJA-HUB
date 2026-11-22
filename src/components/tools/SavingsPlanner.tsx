"use client";

import { Card, Field, Note, Stat, daysUntil, downloadIcs, ghostBtn, inputCls, naira, num, useLocal } from "./kit";
import { CalendarPlus } from "lucide-react";

interface Goal { name: string; target: string; saved: string; by: string }
interface Fees { child: string; fee: string; saved: string; start: string }

export default function SavingsPlanner() {
  const [g, setG] = useLocal<Goal>("nh_goal", { name: "", target: "", saved: "", by: "" });
  const [s, setS] = useLocal<Fees>("nh_fees", { child: "", fee: "", saved: "", start: "" });

  const gLeft = Math.max(0, num(g.target) - num(g.saved));
  const gDays = g.by ? daysUntil(g.by) : null;
  const gMonths = gDays !== null ? Math.max(1, Math.ceil(gDays / 30.4)) : null;
  const fLeft = Math.max(0, num(s.fee) - num(s.saved));
  const fDays = s.start ? daysUntil(s.start) : null;
  const fWeeks = fDays !== null ? Math.max(1, Math.ceil(fDays / 7)) : null;
  const pct = (a: number, b: number) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0);

  return (
    <div className="space-y-4">
      <Card title="Savings goal">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Goal"><input className={inputCls} value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} placeholder="Shop stock, rent, phone…" /></Field>
          <Field label="Target (₦)"><input inputMode="decimal" className={inputCls} value={g.target} onChange={(e) => setG({ ...g, target: e.target.value })} /></Field>
          <Field label="Saved so far (₦)"><input inputMode="decimal" className={inputCls} value={g.saved} onChange={(e) => setG({ ...g, saved: e.target.value })} /></Field>
          <Field label="Target date"><input type="date" className={inputCls} value={g.by} onChange={(e) => setG({ ...g, by: e.target.value })} /></Field>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-stone-200 overflow-hidden"><div className="h-full bg-emerald-600" style={{ width: `${pct(num(g.saved), num(g.target))}%` }} /></div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <Stat label="Still to save" value={naira(gLeft)} />
          <Stat label="Days left" value={gDays === null ? "—" : String(Math.max(0, gDays))} />
          <Stat label="Save per month" value={gMonths ? naira(gLeft / gMonths) : "—"} tone="good" />
        </div>
      </Card>
      <Card title="School fees planner">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Child / school"><input className={inputCls} value={s.child} onChange={(e) => setS({ ...s, child: e.target.value })} /></Field>
          <Field label="Fees for the term (₦)"><input inputMode="decimal" className={inputCls} value={s.fee} onChange={(e) => setS({ ...s, fee: e.target.value })} /></Field>
          <Field label="Saved so far (₦)"><input inputMode="decimal" className={inputCls} value={s.saved} onChange={(e) => setS({ ...s, saved: e.target.value })} /></Field>
          <Field label="Term starts" hint="Use the date on your school's calendar"><input type="date" className={inputCls} value={s.start} onChange={(e) => setS({ ...s, start: e.target.value })} /></Field>
        </div>
        <div className="mt-3 h-2.5 rounded-full bg-stone-200 overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${pct(num(s.saved), num(s.fee))}%` }} /></div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <Stat label="Countdown" value={fDays === null ? "—" : fDays < 0 ? "Started" : `${fDays} days`} tone={fDays !== null && fDays < 14 && fLeft > 0 ? "bad" : "default"} />
          <Stat label="Still to save" value={naira(fLeft)} />
          <Stat label="Save per week" value={fWeeks ? naira(fLeft / fWeeks) : "—"} tone="good" />
        </div>
        {s.start && <button className={`${ghostBtn} mt-3`} onClick={() => downloadIcs(`Term starts${s.child ? ` — ${s.child}` : ""}: fees ${naira(num(s.fee))}`, s.start)}><CalendarPlus className="w-3.5 h-3.5" /> Add term start to my calendar</button>}
        <Note>This is a planning aid only. Naija Hub does not hold your money; save in your own bank, cooperative or Ajo.</Note>
      </Card>
    </div>
  );
}

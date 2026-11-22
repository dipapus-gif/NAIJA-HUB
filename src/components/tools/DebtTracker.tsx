"use client";

import { useState } from "react";
import { CalendarPlus, MessageCircle, Trash2, Check } from "lucide-react";
import { Card, Field, Note, Stat, btnCls, daysUntil, downloadIcs, ghostBtn, inputCls, naira, num, today, uid, useLocal, waLink } from "./kit";

interface Debt { id: string; who: string; dir: "owed" | "owe"; amount: number; due: string; phone: string; note: string; paid: boolean }

export default function DebtTracker() {
  const [items, setItems] = useLocal<Debt[]>("nh_debts", []);
  const [f, setF] = useState({ who: "", dir: "owed", amount: "", due: "", phone: "", note: "" });
  const open = items.filter((d) => !d.paid);
  const owedToMe = open.filter((d) => d.dir === "owed").reduce((s, d) => s + d.amount, 0);
  const iOwe = open.filter((d) => d.dir === "owe").reduce((s, d) => s + d.amount, 0);
  const overdue = open.filter((d) => d.due && daysUntil(d.due) < 0);

  const add = () => {
    if (!f.who.trim() || num(f.amount) <= 0) return;
    setItems([{ id: uid(), who: f.who.trim(), dir: f.dir as Debt["dir"], amount: num(f.amount), due: f.due, phone: f.phone, note: f.note, paid: false }, ...items]);
    setF({ who: "", dir: f.dir, amount: "", due: "", phone: "", note: "" });
  };
  const remind = (d: Debt) =>
    waLink(`Hello ${d.who}, friendly reminder about the ${naira(d.amount)} ${d.note ? `(${d.note}) ` : ""}${d.due ? `due ${d.due}` : ""}. Thank you.`, d.phone);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Owed to me" value={naira(owedToMe)} tone="good" />
        <Stat label="I owe" value={naira(iOwe)} tone={iOwe > 0 ? "bad" : "default"} />
        <Stat label="Overdue" value={String(overdue.length)} tone={overdue.length ? "bad" : "default"} />
      </div>
      <Card title="Add a debt">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Name"><input className={inputCls} value={f.who} onChange={(e) => setF({ ...f, who: e.target.value })} placeholder="Mama Ngozi" /></Field>
          <Field label="Direction"><select className={inputCls} value={f.dir} onChange={(e) => setF({ ...f, dir: e.target.value })}><option value="owed">They owe me</option><option value="owe">I owe them</option></select></Field>
          <Field label="Amount (₦)"><input inputMode="decimal" className={inputCls} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
          <Field label="Due date"><input type="date" className={inputCls} value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></Field>
          <Field label="Phone (for WhatsApp)"><input inputMode="tel" className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="2348012345678" /></Field>
          <Field label="What for"><input className={inputCls} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Goods on credit" /></Field>
        </div>
        <button onClick={add} className={`${btnCls} mt-4`}>Save</button>
      </Card>
      <Card title={`Ledger (${items.length})`}>
        {items.length === 0 ? <p className="text-sm text-stone-500">Nothing yet. Records stay on this device only.</p> : (
          <ul className="divide-y divide-stone-100">
            {[...items].sort((a, b) => Number(a.paid) - Number(b.paid) || (a.due || "9").localeCompare(b.due || "9")).map((d) => {
              const left = d.due ? daysUntil(d.due) : null;
              return (
                <li key={d.id} className={`py-3 ${d.paid ? "opacity-50" : ""}`}>
                  <div className="flex justify-between gap-2 text-sm">
                    <div>
                      <div className="font-semibold">{d.who} <span className="text-xs font-normal text-stone-500">{d.dir === "owed" ? "owes you" : "you owe"}</span></div>
                      <div className="text-xs text-stone-500">{d.note}{d.due && ` · due ${d.due}`}{left !== null && !d.paid && <span className={left < 0 ? " text-rose-700 font-semibold" : ""}> ({left < 0 ? `${-left}d overdue` : left === 0 ? "today" : `${left}d left`})</span>}</div>
                    </div>
                    <div className={`font-bold ${d.dir === "owed" ? "text-emerald-700" : "text-rose-700"}`}>{naira(d.amount)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button className={ghostBtn} onClick={() => setItems(items.map((x) => (x.id === d.id ? { ...x, paid: !x.paid } : x)))}><Check className="w-3.5 h-3.5" /> {d.paid ? "Reopen" : "Mark paid"}</button>
                    {d.dir === "owed" && !d.paid && <a className={ghostBtn} href={remind(d)} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp reminder</a>}
                    {d.due && !d.paid && <button className={ghostBtn} onClick={() => downloadIcs(`${d.dir === "owed" ? "Collect" : "Pay"} ${naira(d.amount)} — ${d.who}`, d.due, d.note)}><CalendarPlus className="w-3.5 h-3.5" /> Phone reminder</button>}
                    <button aria-label="Delete" className={ghostBtn} onClick={() => setItems(items.filter((x) => x.id !== d.id))}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Note>“Phone reminder” downloads a calendar file; open it and your phone alerts you a day before, even when Naija Hub is closed. WhatsApp reminders open a ready-written message that you send yourself.</Note>
      </Card>
    </div>
  );
}

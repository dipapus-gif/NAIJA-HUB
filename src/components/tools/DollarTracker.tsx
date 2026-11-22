"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, Field, Note, Stat, btnCls, inputCls, naira, num, today, uid, usd, useLocal } from "./kit";

interface Pay { id: string; date: string; source: string; gross: number; feePct: number; flat: number; rate: number }

export default function DollarTracker() {
  const [pays, setPays] = useLocal<Pay[]>("nh_usd_income", []);
  const [rate, setRate] = useLocal<string>("nh_usd_rate", "1460");
  const [f, setF] = useState({ date: today(), source: "", gross: "", feePct: "0", flat: "0", rate: "" });
  const net = (p: Pay) => p.gross * (1 - p.feePct / 100) - p.flat;
  const totalGross = pays.reduce((s, p) => s + p.gross, 0);
  const totalNet = pays.reduce((s, p) => s + net(p), 0);
  const totalNgn = pays.reduce((s, p) => s + net(p) * p.rate, 0);
  const mk = today().slice(0, 7);
  const monthNgn = pays.filter((p) => p.date.startsWith(mk)).reduce((s, p) => s + net(p) * p.rate, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Gross earned" value={usd(totalGross)} />
        <Stat label="Kept after fees" value={usd(totalNet)} tone="good" />
        <Stat label="Lost to fees" value={usd(totalGross - totalNet)} tone={totalGross - totalNet > 0 ? "bad" : "default"} />
        <Stat label="This month (₦)" value={naira(monthNgn)} />
      </div>
      <Card title="Log a dollar payment">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Date"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Client / platform"><input className={inputCls} value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} /></Field>
          <Field label="Amount ($)"><input inputMode="decimal" className={inputCls} value={f.gross} onChange={(e) => setF({ ...f, gross: e.target.value })} /></Field>
          <Field label="Platform / withdrawal fee (%)"><input inputMode="decimal" className={inputCls} value={f.feePct} onChange={(e) => setF({ ...f, feePct: e.target.value })} /></Field>
          <Field label="Flat fee ($)"><input inputMode="decimal" className={inputCls} value={f.flat} onChange={(e) => setF({ ...f, flat: e.target.value })} /></Field>
          <Field label="₦ per $ that day" hint={`Blank = default ₦${num(rate).toLocaleString()}`}><input inputMode="decimal" className={inputCls} value={f.rate} onChange={(e) => setF({ ...f, rate: e.target.value })} /></Field>
        </div>
        <div className="flex flex-wrap items-end gap-3 mt-4">
          <button className={btnCls} onClick={() => { if (num(f.gross) > 0) { setPays([{ id: uid(), date: f.date, source: f.source.trim(), gross: num(f.gross), feePct: num(f.feePct), flat: num(f.flat), rate: num(f.rate) || num(rate) }, ...pays]); setF({ ...f, source: "", gross: "", rate: "" }); } }}>Add</button>
          <div className="w-40"><Field label="Default ₦ per $"><input inputMode="decimal" className={inputCls} value={rate} onChange={(e) => setRate(e.target.value)} /></Field></div>
        </div>
        <Note>Enter the rate you actually got (your bank, Payoneer, a bureau de change or the street). Rates move daily and Naija Hub does not fetch live rates here. Fees differ by platform: read yours.</Note>
      </Card>
      <Card title={`Payments (${pays.length}) · total ${naira(totalNgn)}`}>
        {pays.length === 0 ? <p className="text-sm text-stone-500">No payments logged.</p> : (
          <ul className="divide-y divide-stone-100 text-sm">
            {pays.map((p) => (
              <li key={p.id} className="py-2 flex justify-between gap-2 items-center">
                <span>{p.date} · {p.source || "Payment"}<span className="block text-xs text-stone-500">{usd(p.gross)} − fees = {usd(net(p))} @ ₦{p.rate.toLocaleString()}</span></span>
                <span className="font-semibold flex items-center gap-2">{naira(net(p) * p.rate)}<button aria-label="Delete" className="text-stone-400 hover:text-rose-600 cursor-pointer" onClick={() => setPays(pays.filter((x) => x.id !== p.id))}><Trash2 className="w-4 h-4" /></button></span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, Field, Note, Stat, btnCls, inputCls, naira, num, today, uid, useLocal } from "./kit";

const NETWORKS = ["MTN", "Airtel", "Glo", "9mobile"] as const;
interface Rec { id: string; date: string; network: string; kind: "airtime" | "data"; amount: number; gb: number; note: string }

export default function DataBudget() {
  const [recs, setRecs] = useLocal<Rec[]>("nh_data_budget", []);
  const [budget, setBudget] = useLocal<number>("nh_data_budget_cap", 0);
  const [f, setF] = useState({ date: today(), network: "MTN", kind: "data", amount: "", gb: "", note: "" });
  const month = today().slice(0, 7);

  const byMonth = useMemo(() => {
    const m: Record<string, number> = {};
    recs.forEach((r) => (m[r.date.slice(0, 7)] = (m[r.date.slice(0, 7)] || 0) + r.amount));
    return Object.entries(m).sort((a, b) => b[0].localeCompare(a[0]));
  }, [recs]);
  const byNet = useMemo(() => {
    const m: Record<string, { spent: number; gb: number }> = {};
    recs.forEach((r) => {
      const x = (m[r.network] ||= { spent: 0, gb: 0 });
      x.spent += r.amount;
      x.gb += r.gb;
    });
    return Object.entries(m).sort((a, b) => b[1].spent - a[1].spent);
  }, [recs]);
  const thisMonth = recs.filter((r) => r.date.startsWith(month)).reduce((s, r) => s + r.amount, 0);
  const costliestMonth = [...byMonth].sort((a, b) => b[1] - a[1])[0];
  const pct = budget > 0 ? Math.min(100, Math.round((thisMonth / budget) * 100)) : 0;

  const add = () => {
    const amount = num(f.amount);
    if (amount <= 0) return;
    setRecs([{ id: uid(), date: f.date, network: f.network, kind: f.kind as Rec["kind"], amount, gb: f.kind === "data" ? num(f.gb) : 0, note: f.note.trim() }, ...recs]);
    setF({ ...f, amount: "", gb: "", note: "" });
  };

  return (
    <div className="space-y-4">
      <Card title="Log a recharge">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Date"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Network"><select className={inputCls} value={f.network} onChange={(e) => setF({ ...f, network: e.target.value })}>{NETWORKS.map((n) => <option key={n}>{n}</option>)}</select></Field>
          <Field label="Type"><select className={inputCls} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}><option value="data">Data</option><option value="airtime">Airtime</option></select></Field>
          <Field label="Amount paid (₦)"><input inputMode="decimal" className={inputCls} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="2000" /></Field>
          {f.kind === "data" && <Field label="Data bought (GB)"><input inputMode="decimal" className={inputCls} value={f.gb} onChange={(e) => setF({ ...f, gb: e.target.value })} placeholder="3.2" /></Field>}
          <Field label="Note"><input className={inputCls} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Monthly plan" /></Field>
        </div>
        <button onClick={add} className={`${btnCls} mt-4`}>Add recharge</button>
      </Card>

      <Card title="Monthly budget">
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="My monthly cap (₦)"><input inputMode="decimal" className={inputCls} value={budget || ""} onChange={(e) => setBudget(num(e.target.value))} placeholder="10000" /></Field>
          <Stat label="Spent this month" value={naira(thisMonth)} tone={budget > 0 && thisMonth > budget ? "bad" : "default"} />
          <Stat label="Costliest month" value={costliestMonth ? `${costliestMonth[0]} · ${naira(costliestMonth[1])}` : "—"} />
        </div>
        {budget > 0 && (
          <div className="mt-3 h-2.5 rounded-full bg-stone-200 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full ${pct >= 100 ? "bg-rose-500" : "bg-emerald-600"}`} style={{ width: `${pct}%` }} />
          </div>
        )}
      </Card>

      {byNet.length > 0 && (
        <Card title="Which network costs you most">
          <ul className="space-y-2 text-sm">
            {byNet.map(([n, v]) => (
              <li key={n} className="flex justify-between border-b border-stone-100 pb-1.5">
                <span className="font-semibold">{n}</span>
                <span>{naira(v.spent)}{v.gb > 0 && <span className="text-stone-500"> · {v.gb.toFixed(1)} GB · {naira(v.spent / v.gb)}/GB</span>}</span>
              </li>
            ))}
          </ul>
          <Note>Cost per GB only counts recharges where you entered the data size.</Note>
        </Card>
      )}

      <Card title={`History (${recs.length})`}>
        {recs.length === 0 ? <p className="text-sm text-stone-500">No recharges yet. Everything stays on this device.</p> : (
          <ul className="divide-y divide-stone-100 text-sm">
            {recs.slice(0, 50).map((r) => (
              <li key={r.id} className="py-2 flex items-center justify-between gap-2">
                <span>{r.date} · {r.network} {r.kind}{r.gb ? ` ${r.gb}GB` : ""}{r.note ? ` · ${r.note}` : ""}</span>
                <span className="flex items-center gap-2 font-semibold">{naira(r.amount)}
                  <button aria-label="Delete" onClick={() => setRecs(recs.filter((x) => x.id !== r.id))} className="text-stone-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, Field, Note, btnCls, inputCls, num, uid, useLocal } from "./kit";

/** Exact definitions only (international units). Factors are to the base unit of each group. */
const GROUPS: Record<string, { base: string; units: Record<string, number> }> = {
  Weight: { base: "kg", units: { kg: 1, g: 0.001, tonne: 1000, lb: 0.45359237, oz: 0.028349523125 } },
  Length: { base: "m", units: { m: 1, cm: 0.01, km: 1000, ft: 0.3048, inch: 0.0254, yard: 0.9144, mile: 1609.344 } },
  Area: {
    base: "sqm",
    units: {
      sqm: 1, "sq ft": 0.09290304, acre: 4046.8564224, hectare: 10000,
      "plot — Lagos 18×36 m (648 sqm)": 648,
      "plot — Lagos 60×120 ft": 7200 * 0.09290304,
      "plot — 50×100 ft": 5000 * 0.09290304,
    },
  },
  Volume: { base: "litre", units: { litre: 1, ml: 0.001, "US gallon": 3.785411784, "UK gallon": 4.54609, "cubic metre": 1000 } },
};
interface Local { id: string; name: string; item: string; kg: string }

export default function UnitsConverter() {
  const [group, setGroup] = useState("Weight");
  const [from, setFrom] = useState("kg");
  const [to, setTo] = useState("lb");
  const [v, setV] = useState("1");
  const g = GROUPS[group];
  const out = (num(v) * g.units[from]) / g.units[to];
  const pick = (k: string) => {
    setGroup(k);
    const u = Object.keys(GROUPS[k].units);
    setFrom(u[0]);
    setTo(u[1]);
  };

  const [temp, setTemp] = useState("30");
  const [mine, setMine] = useLocal<Local[]>("nh_local_measures", []);
  const [m, setM] = useState({ name: "Derica", item: "", kg: "" });
  const [count, setCount] = useState<Record<string, string>>({});

  return (
    <div className="space-y-4">
      <Card title="Metric, imperial and land">
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.keys(GROUPS).map((k) => (
            <button key={k} onClick={() => pick(k)} className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${group === k ? "bg-amber-400 text-stone-950 border-amber-400" : "border-stone-300"}`}>{k}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 items-end">
          <Field label="Amount"><input inputMode="decimal" className={inputCls} value={v} onChange={(e) => setV(e.target.value)} /></Field>
          <Field label="From"><select className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)}>{Object.keys(g.units).map((u) => <option key={u}>{u}</option>)}</select></Field>
          <Field label="To"><select className={inputCls} value={to} onChange={(e) => setTo(e.target.value)}>{Object.keys(g.units).map((u) => <option key={u}>{u}</option>)}</select></Field>
        </div>
        <p className="mt-4 text-2xl font-display font-bold text-emerald-800">{Number.isFinite(out) ? out.toLocaleString("en-NG", { maximumFractionDigits: 4 }) : "—"} <span className="text-base font-semibold text-stone-600">{to}</span></p>
        {group === "Area" && <Note>A “plot” is a custom, not a law: it differs by state and estate. Always trust the square metres on the survey plan. Plot sizes are from published land-size guides (e.g. Nigeria Property Centre); confirm against your own survey.</Note>}
      </Card>

      <Card title="Temperature">
        <div className="grid grid-cols-2 gap-3">
          <Field label="°C"><input inputMode="decimal" className={inputCls} value={temp} onChange={(e) => setTemp(e.target.value)} /></Field>
          <div className="text-sm pt-5 font-semibold">= {(num(temp) * 9 / 5 + 32).toFixed(1)} °F</div>
        </div>
      </Card>

      <Card title="Derica, kongo, mudu, bag: calibrate your own">
        <p className="text-xs text-stone-600 mb-3">Local measures are not standardised: a derica of rice, garri or beans weighs different amounts, and cups differ from market to market. So Naija Hub ships no made-up values. Weigh your own measure once on a scale, save it, then convert.</p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Measure"><select className={inputCls} value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })}>{["Derica", "Kongo", "Mudu", "Tiya", "Paint bucket", "Bag", "Custom"].map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Of what"><input className={inputCls} value={m.item} onChange={(e) => setM({ ...m, item: e.target.value })} placeholder="Rice" /></Field>
          <Field label="Weighs (kg)"><input inputMode="decimal" className={inputCls} value={m.kg} onChange={(e) => setM({ ...m, kg: e.target.value })} placeholder="1.1" /></Field>
        </div>
        <button className={`${btnCls} mt-3`} onClick={() => { if (m.item.trim() && num(m.kg) > 0) { setMine([...mine, { id: uid(), name: m.name, item: m.item.trim(), kg: m.kg }]); setM({ ...m, item: "", kg: "" }); } }}>Save my measure</button>
        {mine.length > 0 && (
          <ul className="mt-4 divide-y divide-stone-100 text-sm">
            {mine.map((x) => {
              const n = num(count[x.id] ?? "1");
              const kg = n * num(x.kg);
              return (
                <li key={x.id} className="py-2 flex items-center gap-2 justify-between">
                  <span><b>{x.name}</b> of {x.item} = {x.kg} kg</span>
                  <span className="flex items-center gap-2">
                    <input aria-label="How many" inputMode="decimal" className={`${inputCls} !w-16`} value={count[x.id] ?? "1"} onChange={(e) => setCount({ ...count, [x.id]: e.target.value })} />
                    <span className="font-semibold w-28 text-right">{kg.toFixed(2)} kg · {(kg * 2.20462262).toFixed(1)} lb</span>
                    <button aria-label="Delete" className="text-stone-400 hover:text-rose-600 cursor-pointer" onClick={() => setMine(mine.filter((y) => y.id !== x.id))}><Trash2 className="w-4 h-4" /></button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

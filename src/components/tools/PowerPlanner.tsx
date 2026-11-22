"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, Field, Note, Stat, btnCls, ghostBtn, inputCls, naira, num, uid, useLocal } from "./kit";

interface App { id: string; name: string; w: number; qty: number; hrs: number; motor: boolean }
const PRESETS: Omit<App, "id">[] = [
  { name: "LED bulb", w: 10, qty: 4, hrs: 6, motor: false },
  { name: "Ceiling / standing fan", w: 60, qty: 2, hrs: 8, motor: true },
  { name: "Laptop", w: 65, qty: 1, hrs: 8, motor: false },
  { name: "Wi-Fi router", w: 12, qty: 1, hrs: 24, motor: false },
  { name: "TV (LED)", w: 100, qty: 1, hrs: 5, motor: false },
  { name: "Fridge", w: 150, qty: 1, hrs: 8, motor: true },
  { name: "Water pump (0.5 hp)", w: 400, qty: 1, hrs: 1, motor: true },
  { name: "Air conditioner (1 hp)", w: 800, qty: 1, hrs: 6, motor: true },
];

export default function PowerPlanner() {
  const [apps, setApps] = useLocal<App[]>("nh_power_apps", []);
  const [s, setS] = useLocal("nh_power_set", { volt: "24", backup: "6", chem: "lithium", psh: "5", genLph: "", genHrs: "4", fuel: "1289" });
  const [f, setF] = useState({ name: "", w: "", qty: "1", hrs: "", motor: false });

  const runW = apps.reduce((a, x) => a + x.w * x.qty, 0);
  // Motor loads can draw ~3x at start-up: add the extra only for the largest motor.
  const motors = apps.filter((x) => x.motor).map((x) => x.w * 2);
  const peakW = runW + (motors.length ? Math.max(...motors) : 0);
  const dailyWh = apps.reduce((a, x) => a + x.w * x.qty * x.hrs, 0);
  const inverterVA = (peakW * 1.25) / 0.8;
  const dod = s.chem === "lithium" ? 0.8 : 0.5;
  const backupWh = Math.min(dailyWh, runW * num(s.backup));
  const battWh = backupWh / dod / 0.9;
  const battAh = num(s.volt) > 0 ? battWh / num(s.volt) : 0;
  const panelW = num(s.psh) > 0 ? dailyWh / (num(s.psh) * 0.75) : 0;
  const genKva = (peakW * 1.25) / 0.8 / 1000;
  const monthlyGen = num(s.genLph) * num(s.genHrs) * num(s.fuel) * 30;

  return (
    <div className="space-y-4">
      <Card title="Your appliances">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRESETS.map((p) => <button key={p.name} className={ghostBtn} onClick={() => setApps([...apps, { id: uid(), ...p }])}><Plus className="w-3 h-3" />{p.name}</button>)}
        </div>
        <div className="grid grid-cols-[1fr_4.5rem_3.5rem_3.5rem_auto] gap-2 items-center">
          <input aria-label="Name" className={inputCls} placeholder="Appliance" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input aria-label="Watts" inputMode="decimal" className={inputCls} placeholder="Watts" value={f.w} onChange={(e) => setF({ ...f, w: e.target.value })} />
          <input aria-label="Quantity" inputMode="numeric" className={inputCls} placeholder="Qty" value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} />
          <input aria-label="Hours per day" inputMode="decimal" className={inputCls} placeholder="Hrs" value={f.hrs} onChange={(e) => setF({ ...f, hrs: e.target.value })} />
          <button className={btnCls} onClick={() => { if (f.name.trim() && num(f.w) > 0) { setApps([...apps, { id: uid(), name: f.name.trim(), w: num(f.w), qty: num(f.qty) || 1, hrs: num(f.hrs), motor: f.motor }]); setF({ name: "", w: "", qty: "1", hrs: "", motor: false }); } }}>Add</button>
        </div>
        <label className="flex items-center gap-2 text-xs mt-2"><input type="checkbox" className="accent-emerald-700" checked={f.motor} onChange={(e) => setF({ ...f, motor: e.target.checked })} /> Has a motor or compressor (fridge, AC, pump, fan)</label>
        {apps.length > 0 && (
          <ul className="mt-4 divide-y divide-stone-100 text-sm">
            {apps.map((x) => (
              <li key={x.id} className="py-2 flex justify-between items-center gap-2">
                <span>{x.name} · {x.w} W × {x.qty} · {x.hrs} h/day</span>
                <button aria-label="Delete" className="text-stone-400 hover:text-rose-600 cursor-pointer" onClick={() => setApps(apps.filter((y) => y.id !== x.id))}><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        )}
        <Note>Watts are typical values. Check the label on each appliance and edit the numbers for accuracy.</Note>
      </Card>

      <Card title="System settings">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Battery voltage"><select className={inputCls} value={s.volt} onChange={(e) => setS({ ...s, volt: e.target.value })}>{["12", "24", "48"].map((v) => <option key={v} value={v}>{v} V</option>)}</select></Field>
          <Field label="Battery type"><select className={inputCls} value={s.chem} onChange={(e) => setS({ ...s, chem: e.target.value })}><option value="lithium">Lithium (use 80%)</option><option value="lead">Lead-acid / tubular (use 50%)</option></select></Field>
          <Field label="Hours of backup needed"><input inputMode="decimal" className={inputCls} value={s.backup} onChange={(e) => setS({ ...s, backup: e.target.value })} /></Field>
          <Field label="Peak sun hours" hint="Roughly 4–6 across Nigeria; check your area"><input inputMode="decimal" className={inputCls} value={s.psh} onChange={(e) => setS({ ...s, psh: e.target.value })} /></Field>
        </div>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Running load" value={`${Math.round(runW)} W`} />
        <Stat label="Energy per day" value={`${(dailyWh / 1000).toFixed(2)} kWh`} />
        <Stat label="Inverter (min)" value={`${(inverterVA / 1000).toFixed(1)} kVA`} tone="good" />
        <Stat label="Battery bank" value={`${Math.round(battWh)} Wh · ${Math.round(battAh)} Ah @ ${s.volt}V`} />
        <Stat label="Solar panels" value={`${Math.round(panelW)} W`} />
        <Stat label="Generator (min)" value={`${genKva.toFixed(1)} kVA`} />
      </div>

      <Card title="Generator running cost">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Litres per hour" hint="From your generator manual or by measuring"><input inputMode="decimal" className={inputCls} value={s.genLph} onChange={(e) => setS({ ...s, genLph: e.target.value })} /></Field>
          <Field label="Hours per day"><input inputMode="decimal" className={inputCls} value={s.genHrs} onChange={(e) => setS({ ...s, genHrs: e.target.value })} /></Field>
          <Field label="Petrol ₦ per litre"><input inputMode="decimal" className={inputCls} value={s.fuel} onChange={(e) => setS({ ...s, fuel: e.target.value })} /></Field>
        </div>
        <p className="mt-3 text-sm">Estimated fuel cost: <b>{monthlyGen > 0 ? `${naira(monthlyGen)} per month` : "enter litres per hour"}</b></p>
        <Note>Rough sizing for planning, not an installation design. Rules used: inverter = peak load × 1.25 ÷ 0.8 power factor; motor start-up adds about 2× the largest motor’s watts; battery covers your backup hours with 90% efficiency; panels sized with a 0.75 loss factor. Have a certified installer confirm before you buy.</Note>
      </Card>
    </div>
  );
}

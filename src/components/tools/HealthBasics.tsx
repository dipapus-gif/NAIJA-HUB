"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarPlus, Phone, Trash2 } from "lucide-react";
import { Card, Field, Note, btnCls, downloadIcs, downloadText, ghostBtn, inputCls, uid, useLocal } from "./kit";

type Tab = "fever" | "vaccine" | "clinics" | "meds";

// Based on the Paediatric Association of Nigeria routine schedule; the NPHCDA schedule is the official reference.
const VACCINES: { weeks?: number; months?: number; years?: number; label: string; shots: string }[] = [
  { weeks: 0, label: "At birth", shots: "BCG, OPV 0, Hepatitis B (birth dose)" },
  { weeks: 6, label: "6 weeks", shots: "OPV 1, Rotavirus 1, IPV 1, Pentavalent 1, PCV 1" },
  { weeks: 10, label: "10 weeks", shots: "OPV 2, Rotavirus 2, Pentavalent 2, PCV 2" },
  { weeks: 14, label: "14 weeks", shots: "OPV 3, Rotavirus 3, IPV 2, Pentavalent 3, PCV 3" },
  { months: 5, label: "5, 6 and 7 months", shots: "Malaria vaccine (doses 1–3, where available)" },
  { months: 9, label: "9 months", shots: "Measles (MCV 1), Yellow fever, meningitis (Men A/MenFive) where offered" },
  { months: 15, label: "15 months", shots: "Measles 2 (MCV 2), DTP booster, malaria vaccine booster where available" },
  { years: 9, label: "9–14 years (girls)", shots: "HPV vaccine" },
];

const FEVER_DANGER = [
  "Fits or convulsions, or the person cannot be woken properly",
  "Cannot drink or keep fluids down, or vomits again and again",
  "Fast or difficult breathing",
  "Very pale, yellow eyes or very dark (cola-coloured) urine",
  "Stiff neck, severe headache, or a rash that does not fade when pressed",
  "Baby under 3 months with any fever, or a pregnant woman with fever",
  "Fever for more than 2–3 days, or it comes back",
];

interface Place { id: string; kind: "Clinic" | "Pharmacy" | "Hospital"; name: string; phone: string; address: string }
interface Med { id: string; name: string; dose: string; times: string; days: string }

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export default function HealthBasics() {
  const [tab, setTab] = useState<Tab>("fever");
  const [dob, setDob] = useLocal<string>("nh_child_dob", "");
  const [places, setPlaces] = useLocal<Place[]>("nh_places", []);
  const [meds, setMeds] = useLocal<Med[]>("nh_meds", []);
  const [p, setP] = useState({ kind: "Clinic", name: "", phone: "", address: "" });
  const [m, setM] = useState({ name: "", dose: "", times: "08:00,20:00", days: "5" });

  const schedule = useMemo(() => {
    if (!dob) return [];
    const b = new Date(dob + "T00:00:00");
    return VACCINES.map((v) => {
      const due = v.weeks !== undefined ? addDays(b, v.weeks * 7) : new Date(b.getFullYear() + (v.years ?? 0), b.getMonth() + (v.months ?? 0), b.getDate());
      return { ...v, due: due.toISOString().slice(0, 10) };
    });
  }, [dob]);

  const medIcs = (x: Med) => {
    const times = x.times.split(",").map((t) => t.trim()).filter((t) => /^\d{2}:\d{2}$/.test(t));
    const start = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const ev = times.map((t) => [
      "BEGIN:VEVENT", `UID:${uid()}@naijahub`, `DTSTAMP:${start}T000000Z`,
      `DTSTART:${start}T${t.replace(":", "")}00`, `RRULE:FREQ=DAILY;COUNT=${Math.max(1, Number(x.days) || 1)}`,
      `SUMMARY:Take ${x.name}${x.dose ? ` (${x.dose})` : ""}`, "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", `DESCRIPTION:Take ${x.name}`, "END:VALARM", "END:VEVENT",
    ].join("\r\n"));
    downloadText("medicine-reminder.ics", ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Naija Hub//EN", ...ev, "END:VCALENDAR"].join("\r\n"), "text/calendar");
  };

  return (
    <div className="space-y-4">
      <div role="alert" className="flex gap-3 rounded-xl border border-amber-400/60 bg-amber-400/10 text-amber-100 px-4 py-3 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-300" />
        <p>General information, not a diagnosis. In an emergency call <b>112</b>. These cards have not been reviewed by a clinician.</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([["fever", "Fever & malaria"], ["vaccine", "Child vaccines"], ["clinics", "My clinics"], ["meds", "Medicine reminders"]] as [Tab, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${tab === k ? "bg-amber-400 text-stone-950 border-amber-400" : "border-emerald-700 text-emerald-100"}`}>{l}</button>
        ))}
      </div>

      {tab === "fever" && (
        <>
          <Card title="Fever / suspected malaria: what to do">
            <ol className="list-decimal pl-5 space-y-1.5 text-sm">
              <li>Fever in Nigeria is often malaria but not always. <b>Get tested</b> (rapid test or microscopy) at a clinic, health centre or lab before treating.</li>
              <li>Rest, drink plenty of fluids, dress lightly and sponge with lukewarm (not cold) water.</li>
              <li>Take paracetamol for fever, exactly as on the label. Do not give aspirin to children.</li>
              <li>If the test is positive, use the full course of the antimalarial the health worker prescribes. Do not use leftover drugs or stop early.</li>
              <li>Children, pregnant women and anyone with a weak immune system should see a health worker the same day.</li>
              <li>Prevention: sleep under a treated net, clear standing water, close windows at dusk.</li>
            </ol>
          </Card>
          <Card title="Go to a hospital now if there is">
            <ul className="list-disc pl-5 space-y-1 text-sm">{FEVER_DANGER.map((d) => <li key={d}>{d}</li>)}</ul>
            <a href="tel:112" className={`${btnCls} mt-4`}><Phone className="w-4 h-4" /> Call 112</a>
          </Card>
        </>
      )}

      {tab === "vaccine" && (
        <Card title="Child vaccine schedule">
          <Field label="Child's date of birth" hint="Saved on this device only"><input type="date" className={`${inputCls} sm:w-56`} value={dob} onChange={(e) => setDob(e.target.value)} /></Field>
          <ul className="mt-4 divide-y divide-stone-100 text-sm">
            {(schedule.length ? schedule : VACCINES.map((v) => ({ ...v, due: "" }))).map((v) => (
              <li key={v.label} className="py-2.5 flex justify-between gap-3">
                <div><div className="font-semibold">{v.label}</div><div className="text-xs text-stone-600">{v.shots}</div></div>
                {v.due && <div className="text-right shrink-0"><div className="font-semibold">{v.due}</div><button className="text-[11px] text-emerald-800 underline cursor-pointer" onClick={() => downloadIcs(v.label, v.due, v.shots)}>Add reminder</button></div>}
              </li>
            ))}
          </ul>
          <Note>Source: Paediatric Association of Nigeria routine schedule. The NPHCDA national schedule is the official reference; which vaccines are offered, and when, can differ by state and facility (for example malaria vaccine is being rolled out in phases). Confirm dates with your child's clinic and keep the immunisation card. Routine vaccines at government health centres are free of charge.</Note>
        </Card>
      )}

      {tab === "clinics" && (
        <>
          <Card title="Save a clinic or pharmacy">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type"><select className={inputCls} value={p.kind} onChange={(e) => setP({ ...p, kind: e.target.value })}><option>Clinic</option><option>Pharmacy</option><option>Hospital</option></select></Field>
              <Field label="Name"><input className={inputCls} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></Field>
              <Field label="Phone"><input inputMode="tel" className={inputCls} value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></Field>
              <Field label="Address / landmark"><input className={inputCls} value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} /></Field>
            </div>
            <button className={`${btnCls} mt-3`} onClick={() => { if (p.name.trim()) { setPlaces([{ id: uid(), kind: p.kind as Place["kind"], name: p.name.trim(), phone: p.phone, address: p.address }, ...places]); setP({ ...p, name: "", phone: "", address: "" }); } }}>Save</button>
          </Card>
          <Card title={`Saved (${places.length})`}>
            {places.length === 0 ? <p className="text-sm text-stone-500">Nothing saved. Add the places you trust so numbers are one tap away, even offline.</p> : (
              <ul className="divide-y divide-stone-100 text-sm">
                {places.map((x) => (
                  <li key={x.id} className="py-2.5 flex justify-between gap-2 items-center">
                    <div><div className="font-semibold">{x.name} <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded-full">{x.kind}</span></div><div className="text-xs text-stone-500">{x.address}</div></div>
                    <div className="flex items-center gap-2">
                      {x.phone && <a className={ghostBtn} href={`tel:${x.phone}`}><Phone className="w-3.5 h-3.5" /> Call</a>}
                      <button aria-label="Delete" className="text-stone-400 hover:text-rose-600 cursor-pointer" onClick={() => setPlaces(places.filter((y) => y.id !== x.id))}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}

      {tab === "meds" && (
        <>
          <Card title="Medicine reminder">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Medicine"><input className={inputCls} value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} /></Field>
              <Field label="Dose (as prescribed)"><input className={inputCls} value={m.dose} onChange={(e) => setM({ ...m, dose: e.target.value })} placeholder="1 tablet" /></Field>
              <Field label="Times (24h, comma-separated)"><input className={inputCls} value={m.times} onChange={(e) => setM({ ...m, times: e.target.value })} /></Field>
              <Field label="Number of days"><input inputMode="numeric" className={inputCls} value={m.days} onChange={(e) => setM({ ...m, days: e.target.value })} /></Field>
            </div>
            <button className={`${btnCls} mt-3`} onClick={() => { if (m.name.trim()) { setMeds([{ id: uid(), ...m, name: m.name.trim() }, ...meds]); setM({ ...m, name: "", dose: "" }); } }}>Save</button>
          </Card>
          <Card title={`My medicines (${meds.length})`}>
            {meds.length === 0 ? <p className="text-sm text-stone-500">No medicines saved.</p> : (
              <ul className="divide-y divide-stone-100 text-sm">
                {meds.map((x) => (
                  <li key={x.id} className="py-2.5 flex justify-between gap-2 items-center">
                    <div><div className="font-semibold">{x.name} {x.dose && <span className="font-normal text-stone-500">· {x.dose}</span>}</div><div className="text-xs text-stone-500">{x.times} for {x.days} days</div></div>
                    <div className="flex items-center gap-2">
                      <button className={ghostBtn} onClick={() => medIcs(x)}><CalendarPlus className="w-3.5 h-3.5" /> Add alarms</button>
                      <button aria-label="Delete" className="text-stone-400 hover:text-rose-600 cursor-pointer" onClick={() => setMeds(meds.filter((y) => y.id !== x.id))}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Note>“Add alarms” downloads a calendar file with repeating alerts at your times; open it on your phone. Follow your prescription or the pharmacist’s advice. Naija Hub does not advise on doses.</Note>
          </Card>
        </>
      )}
    </div>
  );
}


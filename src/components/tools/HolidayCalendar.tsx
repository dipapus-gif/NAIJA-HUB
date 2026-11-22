"use client";

import { useMemo, useState } from "react";
import { Card, Field, Note, daysUntil, inputCls, today } from "./kit";

interface H { date: string; name: string; fixed: boolean }

// Fixed-date holidays are set by law. Eid and Mawlid depend on moon sighting; Easter dates are astronomical. The Federal Government announces the final dates.
const HOLIDAYS: H[] = [
  { date: "2026-12-25", name: "Christmas Day", fixed: true },
  { date: "2026-12-26", name: "Boxing Day", fixed: true },
  { date: "2027-01-01", name: "New Year's Day", fixed: true },
  { date: "2027-03-10", name: "Eid al-Fitr (Sallah, expected 10–11 Mar)", fixed: false },
  { date: "2027-03-26", name: "Good Friday", fixed: false },
  { date: "2027-03-29", name: "Easter Monday", fixed: false },
  { date: "2027-05-01", name: "Workers' Day", fixed: true },
  { date: "2027-05-17", name: "Eid al-Adha (Sallah, expected 17–18 May)", fixed: false },
  { date: "2027-06-12", name: "Democracy Day", fixed: true },
  { date: "2027-08-15", name: "Id el-Maulud (expected)", fixed: false },
  { date: "2027-10-01", name: "Independence Day", fixed: true },
  { date: "2027-12-25", name: "Christmas Day", fixed: true },
  { date: "2027-12-26", name: "Boxing Day", fixed: true },
];
const wd = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export default function HolidayCalendar() {
  const [from, setFrom] = useState("2026-12-18");
  const [to, setTo] = useState("2027-01-03");
  const upcoming = HOLIDAYS.filter((h) => daysUntil(h.date) >= 0);
  const inRange = useMemo(() => HOLIDAYS.filter((h) => h.date >= from && h.date <= to), [from, to]);
  const days = Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1);
  let working = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(new Date(from).getTime() + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6 && !HOLIDAYS.some((h) => h.date === iso)) working++;
  }
  const next = upcoming[0];

  return (
    <div className="space-y-4">
      {next && <Card><p className="text-xs text-stone-500">Next public holiday</p><p className="font-display font-bold text-xl text-stone-950">{next.name}</p><p className="text-sm text-stone-700">{wd(next.date)} · in {daysUntil(next.date)} days</p></Card>}
      <Card title="Plan Sallah / Christmas travel">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Leave on"><input type="date" className={inputCls} value={from} min={today()} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="Back on"><input type="date" className={inputCls} value={to} min={from} onChange={(e) => setTo(e.target.value)} /></Field>
        </div>
        <p className="text-sm mt-3"><b>{days}</b> days away, about <b>{working}</b> working days off work if you take leave on weekdays that are not holidays.</p>
        {inRange.length > 0 && <ul className="mt-2 text-sm list-disc pl-5">{inRange.map((h) => <li key={h.date + h.name}>{wd(h.date)}: {h.name}</li>)}</ul>}
        <Note>Holiday travel: book buses and flights early and expect heavy traffic and higher fares in the days before and after the holiday. Check FRSC and your transport company for road advisories.</Note>
      </Card>
      <Card title="Public holidays: Dec 2026 – 2027">
        <ul className="divide-y divide-stone-100 text-sm">
          {HOLIDAYS.map((h) => (
            <li key={h.date + h.name} className={`py-2 flex justify-between gap-3 ${daysUntil(h.date) < 0 ? "opacity-40" : ""}`}>
              <span>{h.name}</span>
              <span className="text-right shrink-0">{wd(h.date)}{!h.fixed && <span className="block text-[10px] text-amber-700 font-semibold">TO BE CONFIRMED</span>}</span>
            </li>
          ))}
        </ul>
        <Note>Fixed dates are set by law. Sallah and Maulud follow moon sighting, and Easter dates are confirmed by the Federal Government (Ministry of Interior) each year, so treat “to be confirmed” dates as expected. When a holiday falls on a weekend, the government may declare a weekday instead.</Note>
      </Card>
    </div>
  );
}

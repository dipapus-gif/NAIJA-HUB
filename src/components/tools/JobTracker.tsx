"use client";

import { useState } from "react";
import { CalendarPlus, ExternalLink, Trash2 } from "lucide-react";
import { Card, Field, btnCls, daysUntil, downloadIcs, ghostBtn, inputCls, today, uid, useLocal } from "./kit";

const STATUS = ["Applied", "Interview", "Offer", "Rejected", "No reply"] as const;
interface Job { id: string; company: string; role: string; status: (typeof STATUS)[number]; applied: string; interview: string; follow: string; link: string; notes: string }

export default function JobTracker() {
  const [jobs, setJobs] = useLocal<Job[]>("nh_jobs", []);
  const [f, setF] = useState({ company: "", role: "", status: "Applied", applied: today(), interview: "", follow: "", link: "", notes: "" });
  const [filter, setFilter] = useState("All");
  const counts = STATUS.map((s) => [s, jobs.filter((j) => j.status === s).length] as const);
  const shown = jobs.filter((j) => filter === "All" || j.status === filter);
  const due = jobs.filter((j) => j.follow && j.status !== "Rejected" && j.status !== "Offer" && daysUntil(j.follow) <= 0);

  return (
    <div className="space-y-4">
      {due.length > 0 && <div className="rounded-xl border border-amber-400/60 bg-amber-400/10 text-amber-100 px-4 py-3 text-sm">Follow up today or overdue: {due.map((j) => j.company).join(", ")}</div>}
      <div className="flex flex-wrap gap-2">
        {["All", ...STATUS].map((s) => <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${filter === s ? "bg-amber-400 text-stone-950 border-amber-400" : "border-emerald-700 text-emerald-100"}`}>{s}{s !== "All" && ` ${counts.find((c) => c[0] === s)?.[1] ?? 0}`}</button>)}
      </div>
      <Card title="Add an application or gig">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company / client"><input className={inputCls} value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} /></Field>
          <Field label="Role / gig"><input className={inputCls} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} /></Field>
          <Field label="Status"><select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Applied on"><input type="date" className={inputCls} value={f.applied} onChange={(e) => setF({ ...f, applied: e.target.value })} /></Field>
          <Field label="Interview date"><input type="date" className={inputCls} value={f.interview} onChange={(e) => setF({ ...f, interview: e.target.value })} /></Field>
          <Field label="Follow up on"><input type="date" className={inputCls} value={f.follow} onChange={(e) => setF({ ...f, follow: e.target.value })} /></Field>
          <Field label="Link"><input className={inputCls} value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} placeholder="https://" /></Field>
          <Field label="Notes"><input className={inputCls} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
        </div>
        <button className={`${btnCls} mt-4`} onClick={() => { if (f.company.trim()) { setJobs([{ id: uid(), ...f, status: f.status as Job["status"], company: f.company.trim() }, ...jobs]); setF({ ...f, company: "", role: "", interview: "", follow: "", link: "", notes: "" }); } }}>Save</button>
      </Card>
      <Card title={`Applications (${shown.length})`}>
        {shown.length === 0 ? <p className="text-sm text-stone-500">Nothing here yet. Saved on this device only.</p> : (
          <ul className="divide-y divide-stone-100">
            {shown.map((j) => (
              <li key={j.id} className="py-3 text-sm">
                <div className="flex justify-between gap-2">
                  <div><b>{j.company}</b>{j.role && <span className="text-stone-500"> · {j.role}</span>}<div className="text-xs text-stone-500">Applied {j.applied}{j.interview && ` · interview ${j.interview}`}{j.follow && ` · follow up ${j.follow}`}{j.notes && ` · ${j.notes}`}</div></div>
                  <select aria-label="Status" className="rounded-lg border border-stone-300 bg-white text-xs px-2 py-1 h-8" value={j.status} onChange={(e) => setJobs(jobs.map((x) => (x.id === j.id ? { ...x, status: e.target.value as Job["status"] } : x)))}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {j.interview && <button className={ghostBtn} onClick={() => downloadIcs(`Interview: ${j.company}`, j.interview, j.role)}><CalendarPlus className="w-3.5 h-3.5" /> Interview reminder</button>}
                  {j.follow && <button className={ghostBtn} onClick={() => downloadIcs(`Follow up: ${j.company}`, j.follow, j.role)}><CalendarPlus className="w-3.5 h-3.5" /> Follow-up reminder</button>}
                  {/^https?:\/\//.test(j.link) && <a className={ghostBtn} href={j.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /> Open</a>}
                  <button aria-label="Delete" className={ghostBtn} onClick={() => setJobs(jobs.filter((x) => x.id !== j.id))}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

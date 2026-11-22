"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BedDouble, CalendarClock, Copy, ExternalLink, Loader2, MapPin, Phone, Share2, Siren, Baby, Search, Stethoscope } from "lucide-react";
import { EMERGENCY_NUMBERS, STATES, mapsSearchUrl } from "@/lib/nigeria";

type Tab = "emergency" | "hospitals" | "appointment" | "antenatal" | "bed" | "track";
type ReqType = "APPOINTMENT" | "ANTENATAL" | "BED";

interface SavedRequest {
  ref: string;
  type: ReqType;
  hospital: string;
  state: string;
  createdAt: string;
}

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "emergency", label: "Emergency", icon: <Siren className="w-4 h-4" /> },
  { key: "hospitals", label: "Find a hospital", icon: <MapPin className="w-4 h-4" /> },
  { key: "appointment", label: "Appointment", icon: <CalendarClock className="w-4 h-4" /> },
  { key: "antenatal", label: "Pregnancy / antenatal", icon: <Baby className="w-4 h-4" /> },
  { key: "bed", label: "Hospital bed", icon: <BedDouble className="w-4 h-4" /> },
  { key: "track", label: "Track a request", icon: <Search className="w-4 h-4" /> },
];

const LS_STATE = "naija_hub_state";
const LS_REQS = "naija_hub_health_requests";

const field = "w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-950 placeholder:text-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";
const card = "rounded-2xl bg-white text-stone-900 border border-stone-200 p-5 sm:p-6 shadow-lg";

function safeGet(k: string) {
  try {
    return window.localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string) {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    /* storage unavailable */
  }
}

export function HealthHub() {
  const [tab, setTab] = useState<Tab>("emergency");
  const [stateName, setStateName] = useState("Lagos");
  const [saved, setSaved] = useState<SavedRequest[]>([]);

  useEffect(() => {
    const s = safeGet(LS_STATE);
    if (s && STATES.some((x) => x.name === s)) setStateName(s);
    try {
      setSaved(JSON.parse(safeGet(LS_REQS) || "[]"));
    } catch {
      setSaved([]);
    }
  }, []);

  const st = useMemo(() => STATES.find((s) => s.name === stateName) ?? STATES[0], [stateName]);
  const changeState = (n: string) => {
    setStateName(n);
    safeSet(LS_STATE, n);
  };
  const onSaved = (r: SavedRequest) => {
    const next = [r, ...saved].slice(0, 20);
    setSaved(next);
    safeSet(LS_REQS, JSON.stringify(next));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-white flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-amber-300" /> Health &amp; Emergency
          </h1>
          <p className="text-sm text-emerald-100/80 mt-1">Emergency help, hospitals in every state, and appointment, antenatal and bed requests.</p>
        </div>
        <label className="text-xs font-semibold text-emerald-100">
          Your state
          <select value={stateName} onChange={(e) => changeState(e.target.value)} className="mt-1 block w-full sm:w-56 rounded-xl bg-emerald-950 border border-emerald-700 text-white px-3 py-2 text-sm">
            {STATES.map((s) => (
              <option key={s.name} value={s.name}>{s.name === "FCT" ? "FCT (Abuja)" : s.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-amber-400/60 bg-amber-400/10 text-amber-100 px-4 py-3 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-300" />
        <p><strong>In an emergency, call 112 now.</strong> The request forms below are not for emergencies: Naija Hub records your request and gives you a reference, but does <em>not</em> send it to the hospital, and nothing is booked until the hospital confirms with you.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition cursor-pointer ${
              tab === t.key ? "bg-amber-400 text-stone-950 border-amber-400" : "border-emerald-700 text-emerald-100 hover:border-amber-400"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "emergency" && <Emergency />}
      {tab === "hospitals" && <Hospitals stateName={stateName} />}
      {tab === "appointment" && <RequestForm key="a" type="APPOINTMENT" stateName={stateName} onSaved={onSaved} />}
      {tab === "antenatal" && <RequestForm key="n" type="ANTENATAL" stateName={stateName} onSaved={onSaved} />}
      {tab === "bed" && <RequestForm key="b" type="BED" stateName={stateName} onSaved={onSaved} />}
      {tab === "track" && <Track saved={saved} />}
      <p className="mt-6 text-[11px] text-emerald-100/60">
        Hospital names are public tertiary facilities for {st.name} ({st.capital}); services, bed availability and fees change — always confirm with the hospital. Health information here is general guidance, not a diagnosis.
      </p>
    </div>
  );
}

function Emergency() {
  const [locMsg, setLocMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const shareLocation = () => {
    if (!navigator.geolocation) return setLocMsg("Location is not available on this device. Tell responders the nearest landmark and road.");
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const url = `https://maps.google.com/?q=${p.coords.latitude.toFixed(6)},${p.coords.longitude.toFixed(6)}`;
        const text = `EMERGENCY — I need help at this location: ${url}`;
        setLocMsg(text);
        setBusy(false);
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      },
      () => {
        setBusy(false);
        setLocMsg("Couldn't get your location. Allow location access, or tell responders the nearest landmark and road.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className={card}>
        <h2 className="font-display font-bold text-lg mb-3">Call for help</h2>
        <div className="space-y-3">
          {EMERGENCY_NUMBERS.map((e) => (
            <a key={e.number} href={`tel:${e.number}`} className="flex items-center gap-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 transition">
              <Phone className="w-6 h-6" />
              <span className="text-3xl font-black tabular-nums">{e.number}</span>
              <span className="text-sm leading-tight"><strong className="block">{e.label}</strong>{e.note}</span>
            </a>
          ))}
        </div>
        <button onClick={shareLocation} disabled={busy} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-800 text-emerald-900 font-bold text-sm py-2.5 hover:bg-emerald-50 cursor-pointer">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Send my location on WhatsApp
        </button>
        {locMsg && <p className="mt-2 text-xs text-stone-600 break-words">{locMsg}</p>}
      </div>

      <div className={card}>
        <h2 className="font-display font-bold text-lg mb-2">Road accident — what to do</h2>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm text-stone-700">
          <li>Make yourself safe first: stay off the road, switch on hazard lights, keep bystanders back.</li>
          <li>Call <strong>112</strong> or <strong>FRSC 122</strong>. Give the road, nearest landmark, number of injured and whether anyone is trapped.</li>
          <li>Do not move injured people unless there is fire or immediate danger — you may worsen a neck or back injury.</li>
          <li>For heavy bleeding, press firmly on the wound with a clean cloth and keep pressing.</li>
          <li>Keep the person warm, talk to them, and give no food or drink.</li>
          <li>If someone is not breathing and you are trained in CPR, start it and continue until help arrives.</li>
        </ol>
      </div>

      <div className={`${card} lg:col-span-2`}>
        <h2 className="font-display font-bold text-lg mb-2 flex items-center gap-2"><Baby className="w-5 h-5 text-emerald-800" /> Pregnancy — go to a hospital immediately or call 112 if you have</h2>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 list-disc pl-5 text-sm text-stone-700">
          <li>Heavy vaginal bleeding</li>
          <li>Severe headache with blurred vision, or sudden swelling of face and hands</li>
          <li>Convulsions (fits) or fainting</li>
          <li>Water breaking before your due date, or labour pains that are regular and getting stronger</li>
          <li>The baby moving much less than usual, or not at all</li>
          <li>Severe belly pain, or high fever</li>
        </ul>
        <p className="text-xs text-stone-500 mt-3">Plan ahead: know your nearest hospital that does deliveries, keep your antenatal card and a bag ready, and arrange transport before labour starts.</p>
      </div>
    </div>
  );
}

function Hospitals({ stateName }: { stateName: string }) {
  const st = STATES.find((s) => s.name === stateName) ?? STATES[0];
  return (
    <div className={card}>
      <h2 className="font-display font-bold text-lg mb-1">Hospitals in {st.name === "FCT" ? "the FCT (Abuja)" : st.name}</h2>
      <p className="text-xs text-stone-500 mb-4">Capital: {st.capital} · {st.zone}. Tap “Directions” for the map; phone the hospital before you travel.</p>
      <ul className="divide-y divide-stone-200">
        {st.hospitals.map((h) => (
          <li key={h.name} className="py-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm">{h.name}</p>
              <p className="text-xs text-stone-500">{h.kind} · {h.city}</p>
            </div>
            <a href={mapsSearchUrl(`${h.name}, ${h.city}, ${st.name}, Nigeria`)} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 underline">
              Directions <ExternalLink className="w-3 h-3" />
            </a>
          </li>
        ))}
      </ul>
      <a href={mapsSearchUrl(`hospitals near ${st.capital}, ${st.name}, Nigeria`)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-emerald-800 text-emerald-900 px-4 py-2 text-xs font-bold hover:bg-emerald-50">
        <MapPin className="w-4 h-4" /> Find more hospitals and clinics near {st.capital}
      </a>
    </div>
  );
}

const TITLES: Record<ReqType, { title: string; blurb: string }> = {
  APPOINTMENT: { title: "Request a hospital appointment", blurb: "Tell us which hospital, the clinic you need and when suits you." },
  ANTENATAL: { title: "Request an antenatal (pregnancy) visit", blurb: "Booking, follow-up or delivery planning. WHO recommends at least 8 antenatal contacts." },
  BED: { title: "Request a hospital bed", blurb: "Ask a hospital to hold a bed. For a life-threatening emergency go straight to the Emergency Unit or call 112." },
};

function RequestForm({ type, stateName, onSaved }: { type: ReqType; stateName: string; onSaved: (r: SavedRequest) => void }) {
  const st = STATES.find((s) => s.name === stateName) ?? STATES[0];
  const [hospital, setHospital] = useState(st.hospitals[0].name);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredAt, setPreferredAt] = useState("");
  const [urgency, setUrgency] = useState("ROUTINE");
  const [extraA, setExtraA] = useState("");
  const [extraB, setExtraB] = useState("");
  const [lmp, setLmp] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ ref: string; summary: string } | null>(null);

  useEffect(() => setHospital(st.hospitals[0].name), [st]);

  const edd = useMemo(() => {
    if (!lmp) return "";
    const d = new Date(lmp);
    if (isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + 280);
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
  }, [lmp]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const label = type === "BED" ? `Ward: ${extraA || "General"}; expected stay: ${extraB || "unknown"}` : type === "ANTENATAL" ? `Visit: ${extraA || "Booking"}; LMP: ${lmp || "n/a"}; EDD: ${edd || "n/a"}` : `Clinic: ${extraA || "General outpatient"}`;
    const details = [label, notes].filter(Boolean).join(" | ");
    setBusy(true);
    try {
      const res = await fetch("/api/health/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, fullName, phone, state: st.name, hospital, preferredAt, urgency, details, consent, website }),
      });
      const d = await res.json();
      if (!d.ok) return setError(d.error || "Something went wrong.");
      const summary = `Naija Hub request ${d.ref}\n${TITLES[type].title}\nPatient: ${fullName}\nPhone: ${phone}\nHospital: ${hospital}, ${st.name}\nWhen: ${preferredAt || "as soon as possible"}\nUrgency: ${urgency}\n${details}`;
      setDone({ ref: d.ref, summary });
      onSaved({ ref: d.ref, type, hospital, state: st.name, createdAt: new Date().toISOString() });
    } catch {
      setError("Network problem. Please call the hospital directly.");
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className={card}>
        <h2 className="font-display font-bold text-xl text-emerald-900">Request recorded</h2>
        <p className="mt-2 text-sm">Your reference: <span className="font-mono font-bold text-lg">{done.ref}</span></p>
        <p className="mt-2 text-sm text-stone-700"><strong>Status: pending — not confirmed.</strong> The hospital has not received this yet. Phone or visit the hospital to confirm, and send them the summary below (for example on WhatsApp).</p>
        <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-stone-100 p-3 text-xs text-stone-800">{done.summary}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(done.summary)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-900 text-white px-4 py-2 text-xs font-bold"><Share2 className="w-4 h-4" /> Share on WhatsApp</a>
          <button onClick={() => navigator.clipboard?.writeText(done.summary)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-800 text-emerald-900 px-4 py-2 text-xs font-bold cursor-pointer"><Copy className="w-4 h-4" /> Copy</button>
          <button onClick={() => setDone(null)} className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold cursor-pointer">New request</button>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} className={card} noValidate>
      <h2 className="font-display font-bold text-lg">{TITLES[type].title}</h2>
      <p className="text-xs text-stone-500 mb-4">{TITLES[type].blurb}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-xs font-semibold sm:col-span-2">Hospital in {st.name}
          <select className={`${field} mt-1`} value={hospital} onChange={(e) => setHospital(e.target.value)}>
            {st.hospitals.map((h) => <option key={h.name}>{h.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold">Patient's full name
          <input className={`${field} mt-1`} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
        </label>
        <label className="text-xs font-semibold">Phone number
          <input className={`${field} mt-1`} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="0803 123 4567" autoComplete="tel" required />
        </label>

        {type === "APPOINTMENT" && (
          <label className="text-xs font-semibold">Clinic / department
            <select className={`${field} mt-1`} value={extraA} onChange={(e) => setExtraA(e.target.value)}>
              {["General outpatient", "Paediatrics (children)", "Antenatal / obstetrics", "Surgery", "Eye", "Dental", "Ear, nose & throat", "Medicine / chronic care", "Other"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
        )}
        {type === "ANTENATAL" && (
          <>
            <label className="text-xs font-semibold">Type of visit
              <select className={`${field} mt-1`} value={extraA} onChange={(e) => setExtraA(e.target.value)}>
                {["Booking visit (first)", "Follow-up visit", "Scan / ultrasound", "Delivery planning"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold">First day of last period (optional)
              <input type="date" className={`${field} mt-1`} value={lmp} onChange={(e) => setLmp(e.target.value)} />
              {edd && <span className="block mt-1 text-emerald-800 font-semibold">Estimated due date: {edd}</span>}
            </label>
          </>
        )}
        {type === "BED" && (
          <>
            <label className="text-xs font-semibold">Ward type
              <select className={`${field} mt-1`} value={extraA} onChange={(e) => setExtraA(e.target.value)}>
                {["General ward", "Private / semi-private", "Maternity", "Children's ward", "Intensive care (ICU)"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold">Expected stay (days)
              <input className={`${field} mt-1`} value={extraB} onChange={(e) => setExtraB(e.target.value)} inputMode="numeric" placeholder="e.g. 3" />
            </label>
          </>
        )}

        <label className="text-xs font-semibold">Preferred date / time
          <input className={`${field} mt-1`} type="datetime-local" value={preferredAt} onChange={(e) => setPreferredAt(e.target.value)} />
        </label>
        <label className="text-xs font-semibold">How soon
          <select className={`${field} mt-1`} value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="ROUTINE">Routine</option>
            <option value="SOON">Within a few days</option>
            <option value="URGENT">Urgent (same day)</option>
          </select>
        </label>
        <label className="text-xs font-semibold sm:col-span-2">Reason / notes (keep it short)
          <textarea className={`${field} mt-1`} rows={2} maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
      </div>

      <label className="mt-4 flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-emerald-700" />
        <span>I agree that Naija Hub stores this health request (name, phone, hospital and notes) so I can track it, as described in the <a href="/privacy" className="underline font-semibold text-emerald-800">Privacy Policy</a>. I understand it is not sent to the hospital.</span>
      </label>
      {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2">{error}</p>}
      <button type="submit" disabled={busy || !consent} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm py-3 cursor-pointer">
        {busy && <Loader2 className="w-4 h-4 animate-spin" />} Record my request
      </button>
    </form>
  );
}

function Track({ saved }: { saved: SavedRequest[] }) {
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [res, setRes] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const look = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setRes("");
    try {
      const r = await fetch(`/api/health/requests?ref=${encodeURIComponent(ref)}&phone=${encodeURIComponent(phone)}`);
      const d = await r.json();
      if (!d.ok) return setRes(d.error);
      const q = d.request;
      setRes(`${q.ref} — ${q.type.toLowerCase()} at ${q.hospital}, ${q.state}. Status: ${String(q.status).replace(/_/g, " ").toLowerCase()}. Remember: the hospital must confirm directly with you.`);
    } catch {
      setRes("Network problem. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <form onSubmit={look} className={card}>
        <h2 className="font-display font-bold text-lg mb-3">Look up a request</h2>
        <div className="space-y-3">
          <input className={field} placeholder="Reference e.g. NH-AB12CD" value={ref} onChange={(e) => setRef(e.target.value)} />
          <input className={field} placeholder="Phone number used" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
          <button disabled={busy} className="w-full rounded-xl bg-emerald-900 text-white font-bold text-sm py-2.5 cursor-pointer">{busy ? "Looking…" : "Check status"}</button>
        </div>
        {res && <p className="mt-3 text-sm text-stone-700">{res}</p>}
      </form>
      <div className={card}>
        <h2 className="font-display font-bold text-lg mb-3">On this device</h2>
        {saved.length === 0 ? (
          <p className="text-sm text-stone-500">No requests yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {saved.map((s) => (
              <li key={s.ref} className="rounded-lg bg-stone-100 px-3 py-2">
                <span className="font-mono font-bold">{s.ref}</span> · {s.type.toLowerCase()} · {s.hospital}
                <span className="block text-xs text-stone-500">{new Date(s.createdAt).toLocaleString("en-NG")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

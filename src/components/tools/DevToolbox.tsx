"use client";

import { useMemo, useState } from "react";
import { Card, Field, btnCls, ghostBtn, inputCls } from "./kit";

type Tab = "json" | "base64" | "regex" | "uuid" | "time";
const area = `${inputCls} font-mono text-xs`;

function b64enc(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
function b64dec(s: string) {
  const bin = atob(s.trim());
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export default function DevToolbox() {
  const [tab, setTab] = useState<Tab>("json");
  const [json, setJson] = useState('{"name":"Naija Hub","tools":[1,2,3]}');
  const [jsonOut, setJsonOut] = useState("");
  const [jsonErr, setJsonErr] = useState("");
  const [b, setB] = useState("");
  const [bOut, setBOut] = useState("");
  const [re, setRe] = useState("\\b0[789][01]\\d{8}\\b");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Call 08031234567 or 09012345678 today");
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState("5");
  const [ts, setTs] = useState(String(Math.floor(Date.now() / 1000)));
  const [dt, setDt] = useState("");

  const run = (pretty: boolean) => {
    try {
      const v = JSON.parse(json);
      setJsonOut(pretty ? JSON.stringify(v, null, 2) : JSON.stringify(v));
      setJsonErr("");
    } catch (e) {
      setJsonErr((e as Error).message);
      setJsonOut("");
    }
  };

  const matches = useMemo(() => {
    try {
      const r = new RegExp(re, flags.includes("g") ? flags : flags + "g");
      return { list: [...text.matchAll(r)].slice(0, 200).map((m) => ({ v: m[0], i: m.index ?? 0 })), err: "" };
    } catch (e) {
      return { list: [], err: (e as Error).message };
    }
  }, [re, flags, text]);

  const tsDate = (() => {
    const n = Number(ts);
    if (!Number.isFinite(n) || ts.trim() === "") return null;
    const ms = Math.abs(n) < 1e11 ? n * 1000 : n;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  })();
  const dtParsed = dt ? new Date(dt) : null;
  const copy = (s: string) => navigator.clipboard?.writeText(s).catch(() => {});

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {([["json", "JSON"], ["base64", "Base64"], ["regex", "Regex"], ["uuid", "UUID"], ["time", "Timestamp"]] as [Tab, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-3.5 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${tab === k ? "bg-amber-400 text-stone-950 border-amber-400" : "border-emerald-700 text-emerald-100"}`}>{l}</button>
        ))}
      </div>
      <Card>
        {tab === "json" && (
          <div className="space-y-3">
            <textarea aria-label="JSON input" rows={7} className={area} value={json} onChange={(e) => setJson(e.target.value)} />
            <div className="flex gap-2"><button className={btnCls} onClick={() => run(true)}>Format</button><button className={ghostBtn} onClick={() => run(false)}>Minify</button>{jsonOut && <button className={ghostBtn} onClick={() => copy(jsonOut)}>Copy</button>}</div>
            {jsonErr && <p className="text-sm text-rose-700">Invalid JSON: {jsonErr}</p>}
            {jsonOut && <pre className="rounded-xl bg-stone-100 p-3 text-xs overflow-auto max-h-80">{jsonOut}</pre>}
          </div>
        )}
        {tab === "base64" && (
          <div className="space-y-3">
            <textarea aria-label="Input" rows={5} className={area} value={b} onChange={(e) => setB(e.target.value)} placeholder="Text or Base64" />
            <div className="flex gap-2">
              <button className={btnCls} onClick={() => setBOut(b64enc(b))}>Encode</button>
              <button className={ghostBtn} onClick={() => { try { setBOut(b64dec(b)); } catch { setBOut("Not valid Base64"); } }}>Decode</button>
              {bOut && <button className={ghostBtn} onClick={() => copy(bOut)}>Copy</button>}
            </div>
            {bOut && <pre className="rounded-xl bg-stone-100 p-3 text-xs whitespace-pre-wrap break-all">{bOut}</pre>}
          </div>
        )}
        {tab === "regex" && (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_5rem] gap-3"><Field label="Pattern"><input className={area} value={re} onChange={(e) => setRe(e.target.value)} /></Field><Field label="Flags"><input className={area} value={flags} onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))} /></Field></div>
            <textarea aria-label="Test text" rows={4} className={area} value={text} onChange={(e) => setText(e.target.value)} />
            {matches.err ? <p className="text-sm text-rose-700">{matches.err}</p> : <p className="text-sm"><b>{matches.list.length}</b> match{matches.list.length === 1 ? "" : "es"}</p>}
            <ul className="text-xs font-mono space-y-1">{matches.list.map((m, k) => <li key={k} className="rounded bg-emerald-50 px-2 py-1">{m.v} <span className="text-stone-500">@ {m.i}</span></li>)}</ul>
          </div>
        )}
        {tab === "uuid" && (
          <div className="space-y-3">
            <div className="flex items-end gap-3"><div className="w-24"><Field label="How many"><input inputMode="numeric" className={inputCls} value={count} onChange={(e) => setCount(e.target.value)} /></Field></div><button className={btnCls} onClick={() => setUuids(Array.from({ length: Math.min(50, Math.max(1, Number(count) || 1)) }, () => crypto.randomUUID()))}>Generate v4 UUIDs</button>{uuids.length > 0 && <button className={ghostBtn} onClick={() => copy(uuids.join("\n"))}>Copy all</button>}</div>
            <ul className="text-xs font-mono space-y-1">{uuids.map((u) => <li key={u} className="rounded bg-stone-100 px-2 py-1">{u}</li>)}</ul>
          </div>
        )}
        {tab === "time" && (
          <div className="space-y-4 text-sm">
            <Field label="Unix timestamp (seconds or milliseconds)"><input className={area} value={ts} onChange={(e) => setTs(e.target.value)} /></Field>
            {tsDate ? <div className="font-mono text-xs space-y-1"><div>UTC: {tsDate.toISOString()}</div><div>Lagos (WAT): {tsDate.toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "full", timeStyle: "medium" })}</div></div> : <p className="text-rose-700 text-xs">Not a valid timestamp</p>}
            <Field label="Date and time to Unix"><input type="datetime-local" className={inputCls} value={dt} onChange={(e) => setDt(e.target.value)} /></Field>
            {dtParsed && !isNaN(dtParsed.getTime()) && <div className="font-mono text-xs">Seconds: {Math.floor(dtParsed.getTime() / 1000)} · Milliseconds: {dtParsed.getTime()} (in your device’s time zone)</div>}
            <button className={ghostBtn} onClick={() => setTs(String(Math.floor(Date.now() / 1000)))}>Use now</button>
          </div>
        )}
      </Card>
      <p className="text-[11px] text-stone-400">Everything runs in your browser. Nothing you paste here is sent anywhere, and it works offline once the page has loaded.</p>
    </div>
  );
}

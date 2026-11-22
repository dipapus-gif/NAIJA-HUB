"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Card, Field, Note, btnCls, ghostBtn, inputCls, uid, useLocal } from "./kit";

interface Target { id: string; url: string }
interface Res { state: "up" | "reachable" | "down"; ms: number; detail: string }
interface Mock { id: string; method: string; path: string; status: string; delay: string; body: string }

async function ping(url: string): Promise<Res> {
  const t0 = performance.now();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(url, { signal: ctl.signal, cache: "no-store" });
    return { state: r.ok ? "up" : "down", ms: Math.round(performance.now() - t0), detail: `HTTP ${r.status}` };
  } catch {
    try {
      // Blocked by CORS? A no-cors request still tells us whether the server answered at all.
      await fetch(url, { signal: ctl.signal, mode: "no-cors", cache: "no-store" });
      return { state: "reachable", ms: Math.round(performance.now() - t0), detail: "Server answered (status hidden by browser CORS rules)" };
    } catch {
      return { state: "down", ms: Math.round(performance.now() - t0), detail: ctl.signal.aborted ? "Timed out after 8 s" : "No answer (offline, wrong address or blocked)" };
    }
  } finally {
    clearTimeout(timer);
  }
}

export default function ApiChecker() {
  const [targets, setTargets] = useLocal<Target[]>("nh_status_targets", [{ id: "a", url: "https://naija-hub-nine.vercel.app/api/community" }]);
  const [results, setResults] = useState<Record<string, Res | "busy">>({});
  const [url, setUrl] = useState("");
  const [mocks, setMocks] = useLocal<Mock[]>("nh_mocks", [{ id: "m1", method: "GET", path: "/api/users/1", status: "200", delay: "300", body: '{\n  "id": 1,\n  "name": "Ada"\n}' }]);
  const [m, setM] = useState({ method: "GET", path: "/api/", status: "200", delay: "0", body: '{ "ok": true }' });
  const [out, setOut] = useState("");

  const run = async (t: Target) => {
    setResults((r) => ({ ...r, [t.id]: "busy" }));
    const res = await ping(t.url);
    setResults((r) => ({ ...r, [t.id]: res }));
  };
  const runMock = async (x: Mock) => {
    await new Promise((r) => setTimeout(r, Math.min(5000, Number(x.delay) || 0)));
    setOut(`${x.method} ${x.path} → ${x.status}\n\n${x.body}`);
  };
  const handlers = mocks.map((x) => `  http.${x.method.toLowerCase()}("${x.path}", async () => {\n    await delay(${Number(x.delay) || 0});\n    return HttpResponse.json(${x.body.trim() || "null"}, { status: ${Number(x.status) || 200} });\n  }),`).join("\n");

  return (
    <div className="space-y-4">
      <Card title="Status page checker">
        <div className="flex gap-2">
          <input aria-label="URL" className={inputCls} placeholder="https://api.example.com/health" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button className={btnCls} onClick={() => { if (/^https?:\/\//.test(url.trim())) { setTargets([...targets, { id: uid(), url: url.trim() }]); setUrl(""); } }}><Plus className="w-4 h-4" /> Add</button>
        </div>
        <ul className="mt-4 divide-y divide-stone-100 text-sm">
          {targets.map((t) => {
            const r = results[t.id];
            return (
              <li key={t.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0"><div className="truncate font-mono text-xs">{t.url}</div>
                  {r && r !== "busy" && <div className={`text-xs mt-0.5 ${r.state === "down" ? "text-rose-700" : "text-emerald-700"}`}>{r.state === "up" ? "UP" : r.state === "reachable" ? "REACHABLE" : "DOWN"} · {r.ms} ms · {r.detail}</div>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className={ghostBtn} onClick={() => run(t)} disabled={r === "busy"}>{r === "busy" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Check"}</button>
                  <button aria-label="Remove" className="text-stone-400 hover:text-rose-600 cursor-pointer" onClick={() => setTargets(targets.filter((x) => x.id !== t.id))}><Trash2 className="w-4 h-4" /></button>
                </div>
              </li>
            );
          })}
        </ul>
        <button className={`${ghostBtn} mt-3`} onClick={() => targets.forEach(run)}>Check all</button>
        <Note>Checks run from your browser, so they show what you can reach from your own network. Servers that block cross-site requests show “reachable” without a status code. Localhost addresses on your own machine work too, if that server allows it.</Note>
      </Card>

      <Card title="Mock API designer">
        <div className="grid grid-cols-[5rem_1fr_4.5rem_5rem] gap-2">
          <select aria-label="Method" className={inputCls} value={m.method} onChange={(e) => setM({ ...m, method: e.target.value })}>{["GET", "POST", "PUT", "PATCH", "DELETE"].map((x) => <option key={x}>{x}</option>)}</select>
          <input aria-label="Path" className={`${inputCls} font-mono text-xs`} value={m.path} onChange={(e) => setM({ ...m, path: e.target.value })} />
          <input aria-label="Status" inputMode="numeric" className={inputCls} value={m.status} onChange={(e) => setM({ ...m, status: e.target.value })} />
          <input aria-label="Delay ms" inputMode="numeric" className={inputCls} value={m.delay} onChange={(e) => setM({ ...m, delay: e.target.value })} placeholder="ms" />
        </div>
        <div className="mt-2"><Field label="JSON response body"><textarea rows={4} className={`${inputCls} font-mono text-xs`} value={m.body} onChange={(e) => setM({ ...m, body: e.target.value })} /></Field></div>
        <button className={`${btnCls} mt-3`} onClick={() => { try { JSON.parse(m.body); } catch { setOut("The body is not valid JSON."); return; } setMocks([...mocks, { id: uid(), ...m }]); }}>Save endpoint</button>
        <ul className="mt-4 divide-y divide-stone-100 text-sm">
          {mocks.map((x) => (
            <li key={x.id} className="py-2 flex items-center justify-between gap-2"><span className="font-mono text-xs">{x.method} {x.path} → {x.status} ({x.delay || 0} ms)</span>
              <span className="flex gap-2"><button className={ghostBtn} onClick={() => runMock(x)}>Try</button><button aria-label="Delete" className="text-stone-400 hover:text-rose-600 cursor-pointer" onClick={() => setMocks(mocks.filter((y) => y.id !== x.id))}><Trash2 className="w-4 h-4" /></button></span></li>
          ))}
        </ul>
        {out && <pre className="mt-3 rounded-xl bg-stone-100 p-3 text-xs overflow-auto">{out}</pre>}
        {mocks.length > 0 && (
          <details className="mt-4"><summary className="text-xs font-semibold cursor-pointer">Export as MSW handlers (use in your tests or dev server)</summary>
            <pre className="mt-2 rounded-xl bg-stone-100 p-3 text-[11px] overflow-auto">{`import { http, HttpResponse, delay } from "msw";\n\nexport const handlers = [\n${handlers}\n];`}</pre></details>
        )}
        <Note>This simulates responses inside this page so you can design and preview them. It does not open a server that other apps can call; export the handlers to run them in your own project.</Note>
      </Card>
    </div>
  );
}

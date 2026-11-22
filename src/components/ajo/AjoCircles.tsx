"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, Copy, Loader2, Plus, Users, X } from "lucide-react";
import { Card, Field, btnCls, ghostBtn, inputCls, naira } from "@/components/tools/kit";

interface Summary { id: number; name: string; code: string; amount_ngn: number; frequency: string; status: string; round: number; members: string | number; organiser: boolean }
interface Member { id: number; name: string; position: number; hasAccount: boolean; phone?: string; payoutBank?: string; payoutAcct?: string }
interface Pay { id: number; round: number; memberId: number; amount: number; reference: string; status: "REPORTED" | "CONFIRMED" | "REJECTED" }
interface Circle {
  id: number; code: string; name: string; amount: number; frequency: string; status: string; round: number;
  pool: { bank: string; accountNo: string; accountName: string };
  isOrganiser: boolean; myMemberId: number | null; collectorId: number | null;
  members: Member[]; payments: Pay[]; payouts: { round: number; memberId: number; amount: number; reference: string }[];
}

async function api(method: "GET" | "POST", body?: unknown, query = "") {
  const r = await fetch(`/api/ajo${query}`, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({ ok: false, error: "Network error." }));
  return { status: r.status, ...j } as { status: number; ok: boolean; error?: string; [k: string]: unknown };
}

export function AjoCircles() {
  const [list, setList] = useState<Summary[] | null>(null);
  const [auth, setAuth] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", amount: "", frequency: "Monthly", poolBank: "", poolAcctNo: "", poolAcctName: "", consent: false });
  const [code, setCode] = useState("");

  const refresh = useCallback(async () => {
    const r = await api("GET");
    if (r.status === 401) { setAuth(false); setList([]); return; }
    setList((r.circles as Summary[]) ?? []);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const act = async (body: unknown, after?: (r: { [k: string]: unknown }) => void) => {
    setBusy(true); setMsg("");
    const r = await api("POST", body);
    setBusy(false);
    if (!r.ok) { setMsg(r.error || "Failed."); return false; }
    after?.(r);
    await refresh();
    return true;
  };

  if (!auth) {
    return (
      <Card title="Sign in to use Ajo circles">
        <p className="text-sm">Circles are shared between members, so you need a free account to create or join one.</p>
        <div className="flex gap-2 mt-4"><Link href="/login?next=/ajo" className={btnCls}>Sign in</Link><Link href="/register?next=/ajo" className={ghostBtn}>Create account</Link></div>
      </Card>
    );
  }
  if (openId) return <Detail id={openId} onBack={() => { setOpenId(null); refresh(); }} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-3xl text-white flex items-center gap-2"><Users className="w-7 h-7 text-amber-300" /> Ajo circles</h1>
        <p className="text-sm text-emerald-100/80 mt-1">One central pool account. Everybody pays in, the app tracks who has paid, and it shows whose turn it is to collect.</p>
      </div>
      <PoolNotice />
      {msg && <p role="alert" className="text-sm rounded-lg bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2">{msg}</p>}

      <Card title="Your circles">
        {list === null ? <Loader2 className="w-5 h-5 animate-spin text-stone-400" /> : list.length === 0 ? <p className="text-sm text-stone-500">No circles yet. Create one or join with a code below.</p> : (
          <ul className="divide-y divide-stone-100">
            {list.map((c) => (
              <li key={c.id}><button onClick={() => setOpenId(c.id)} className="w-full text-left py-3 flex justify-between gap-3 cursor-pointer">
                <span><b>{c.name}</b> {c.organiser && <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">ORGANISER</span>}<span className="block text-xs text-stone-500">{naira(c.amount_ngn)} {c.frequency.toLowerCase()} · {c.members} members · round {Math.min(Number(c.round) + 1, Number(c.members))}</span></span>
                <span className="text-xs font-semibold text-stone-500 self-center">{c.status}</span>
              </button></li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Join a circle">
          <Field label="Invite code"><input className={`${inputCls} uppercase`} placeholder="AJO-XXXXXX" value={code} onChange={(e) => setCode(e.target.value)} /></Field>
          <button disabled={busy || !code.trim()} className={`${btnCls} mt-3`} onClick={async () => { const ok = await act({ action: "join", code }, (r) => setOpenId(Number(r.id))); if (ok) setCode(""); }}>Join</button>
        </Card>
        <Card title="Start a circle">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Circle name"><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Each member pays (₦)"><input inputMode="numeric" className={inputCls} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
            <Field label="How often"><select className={inputCls} value={f.frequency} onChange={(e) => setF({ ...f, frequency: e.target.value })}><option>Monthly</option><option>Weekly</option></select></Field>
            <Field label="Pool bank"><input className={inputCls} value={f.poolBank} onChange={(e) => setF({ ...f, poolBank: e.target.value })} /></Field>
            <Field label="Pool account no."><input inputMode="numeric" maxLength={10} className={inputCls} value={f.poolAcctNo} onChange={(e) => setF({ ...f, poolAcctNo: e.target.value })} /></Field>
            <Field label="Account name"><input className={inputCls} value={f.poolAcctName} onChange={(e) => setF({ ...f, poolAcctName: e.target.value })} /></Field>
          </div>
          <label className="flex gap-2 text-xs mt-3"><input type="checkbox" className="mt-0.5 accent-emerald-700" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /> I understand Naija Hub does not hold or move money, and that I (the organiser) hold the pool account and make the payouts.</label>
          <button disabled={busy} className={`${btnCls} mt-3`} onClick={() => act({ action: "create", ...f, amount: Number(f.amount) }, (r) => setOpenId(Number(r.id)))}><Plus className="w-4 h-4" /> Create circle</button>
        </Card>
      </div>
    </div>
  );
}

function PoolNotice() {
  return (
    <div role="note" className="flex gap-3 rounded-xl border border-amber-400/60 bg-amber-400/10 text-amber-100 px-4 py-3 text-sm">
      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-300" />
      <p><b>How the pool works.</b> Naija Hub is a ledger, not a bank or payment company. It does not hold or move money. Members transfer to the pool account the organiser names; the organiser confirms each payment against the bank alert; the app only lets a payout be recorded once <i>everyone</i> has paid, and the organiser then sends the payout to the person whose turn it is. Only join circles run by people you know and trust. Automatic collection and payout would need a licensed payment partner.</p>
    </div>
  );
}

function Detail({ id, onBack }: { id: number; onBack: () => void }) {
  const [c, setC] = useState<Circle | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState("");
  const [payRef, setPayRef] = useState("");
  const [nm, setNm] = useState({ name: "", phone: "" });
  const [pa, setPa] = useState({ bank: "", acct: "" });
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const r = await api("GET", undefined, `?id=${id}`);
    if (r.ok) setC(r.circle as Circle); else setMsg(r.error || "Could not load.");
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const act = async (body: Record<string, unknown>) => {
    setBusy(true); setMsg("");
    const r = await api("POST", { id, ...body });
    setBusy(false);
    if (!r.ok) setMsg(r.error || "Failed."); else await load();
    return r.ok;
  };

  if (!c) return <div>{msg ? <p className="text-rose-300">{msg}</p> : <Loader2 className="w-6 h-6 animate-spin text-amber-300" />}<button onClick={onBack} className="mt-3 text-xs underline text-emerald-100 cursor-pointer">Back</button></div>;

  const n = c.members.length;
  const round = c.round;
  const done = c.status === "COMPLETED";
  const collector = c.members.find((m) => m.id === c.collectorId);
  const roundPays = c.payments.filter((p) => p.round === round);
  const payOf = (mid: number) => roundPays.find((p) => p.memberId === mid);
  const confirmed = roundPays.filter((p) => p.status === "CONFIRMED").length;
  const pot = c.amount * n;
  const mine = c.members.find((m) => m.id === c.myMemberId);
  const myPay = mine ? payOf(mine.id) : undefined;
  const copy = (s: string) => { navigator.clipboard?.writeText(s).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {}); };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-100 hover:text-amber-300 cursor-pointer"><ArrowLeft className="w-3.5 h-3.5" /> All circles</button>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display font-bold text-3xl text-white">{c.name}</h1><p className="text-sm text-emerald-100/80">{naira(c.amount)} {c.frequency.toLowerCase()} · {n} members · pot {naira(pot)}</p></div>
        <button onClick={() => copy(c.code)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-3 py-2 text-xs font-mono text-emerald-100 cursor-pointer">Invite code: <b>{c.code}</b> {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}</button>
      </div>
      <PoolNotice />
      {msg && <p role="alert" className="text-sm rounded-lg bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2">{msg}</p>}

      <Card title="Central pool account">
        <p className="text-sm"><b>{c.pool.accountName}</b> · {c.pool.bank} · <span className="font-mono">{c.pool.accountNo}</span> <button className="ml-1 text-xs underline cursor-pointer" onClick={() => copy(c.pool.accountNo)}>copy</button></p>
        <p className="text-xs text-stone-500 mt-1">Before paying, confirm the account name with the organiser by phone or in person.</p>
      </Card>

      {done ? (
        <Card title="Circle complete"><p className="text-sm">All {n} rounds have been paid out.</p></Card>
      ) : (
        <Card title={`Round ${round + 1} of ${n}: ${collector?.name ?? "…"} collects ${naira(pot)}`}>
          <div className="h-2.5 rounded-full bg-stone-200 overflow-hidden mb-4"><div className="h-full bg-emerald-600" style={{ width: `${n ? (confirmed / n) * 100 : 0}%` }} /></div>
          <p className="text-xs text-stone-600 mb-3">{confirmed} of {n} payments confirmed. Payout unlocks when everyone is confirmed.</p>
          <ul className="divide-y divide-stone-100 text-sm">
            {c.members.map((m) => {
              const p = payOf(m.id);
              return (
                <li key={m.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span><b>{m.position + 1}. {m.name}</b>{m.id === c.collectorId && <span className="ml-2 text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">COLLECTS NOW</span>}{c.isOrganiser && m.phone && <span className="block text-xs text-stone-500">{m.phone}</span>}{p && <span className="block text-xs text-stone-500">Ref: {p.reference}</span>}</span>
                  <span className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${p?.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-800" : p?.status === "REPORTED" ? "bg-amber-100 text-amber-800" : p?.status === "REJECTED" ? "bg-rose-100 text-rose-800" : "bg-stone-100 text-stone-600"}`}>{p?.status === "CONFIRMED" ? "PAID" : p?.status === "REPORTED" ? "AWAITING CONFIRMATION" : p?.status === "REJECTED" ? "REJECTED" : "NOT PAID"}</span>
                    {c.isOrganiser && p?.status === "REPORTED" && <><button disabled={busy} aria-label="Confirm" className={ghostBtn} onClick={() => act({ action: "confirm", paymentId: p.id })}><Check className="w-3.5 h-3.5" /></button><button disabled={busy} aria-label="Reject" className={ghostBtn} onClick={() => act({ action: "reject", paymentId: p.id })}><X className="w-3.5 h-3.5" /></button></>}
                  </span>
                </li>
              );
            })}
          </ul>

          {mine && myPay?.status !== "CONFIRMED" && (
            <div className="mt-4 rounded-xl bg-stone-50 border border-stone-200 p-3">
              <Field label={`I have paid ${naira(c.amount)} to the pool`} hint="Enter the transfer reference or the time and amount on your receipt"><input className={inputCls} value={payRef} onChange={(e) => setPayRef(e.target.value)} /></Field>
              <button disabled={busy || !payRef.trim()} className={`${btnCls} mt-2`} onClick={async () => { if (await act({ action: "report", reference: payRef })) setPayRef(""); }}>Tell the organiser I paid</button>
            </div>
          )}

          {c.isOrganiser && (
            <div className="mt-4 rounded-xl bg-stone-50 border border-stone-200 p-3 text-sm">
              <p className="font-semibold">Payout to {collector?.name}: {naira(pot)}</p>
              {collector?.payoutAcct ? <p className="text-xs text-stone-600">Send to: {collector.payoutBank} · <span className="font-mono">{collector.payoutAcct}</span></p> : <p className="text-xs text-stone-600">No payout account saved for {collector?.name} yet. Ask them for it, then save it below.</p>}
              <Field label="Transfer reference of the payout you sent"><input className={inputCls} value={ref} onChange={(e) => setRef(e.target.value)} /></Field>
              <button disabled={busy || confirmed < n || !ref.trim()} className={`${btnCls} mt-2`} onClick={async () => { if (await act({ action: "payout", reference: ref })) setRef(""); }}>Record payout and start next round</button>
              {confirmed < n && <p className="text-[11px] text-stone-500 mt-1">Locked until all {n} payments are confirmed.</p>}
            </div>
          )}
        </Card>
      )}

      {(c.isOrganiser || mine) && (
        <Card title="Payout account">
          <p className="text-xs text-stone-600 mb-2">Where you want the pot sent when it is your turn. Only the organiser can see it.</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bank"><input className={inputCls} value={pa.bank} onChange={(e) => setPa({ ...pa, bank: e.target.value })} /></Field>
            <Field label="Account number"><input inputMode="numeric" maxLength={10} className={inputCls} value={pa.acct} onChange={(e) => setPa({ ...pa, acct: e.target.value })} /></Field>
          </div>
          <button disabled={busy} className={`${btnCls} mt-3`} onClick={() => mine && act({ action: "setPayoutAccount", memberId: mine.id, ...pa })}>Save my payout account</button>
        </Card>
      )}

      {c.isOrganiser && round === 0 && !done && (
        <Card title="Add a member who has no account">
          <div className="grid grid-cols-2 gap-3"><Field label="Name"><input className={inputCls} value={nm.name} onChange={(e) => setNm({ ...nm, name: e.target.value })} /></Field><Field label="Phone"><input inputMode="tel" className={inputCls} value={nm.phone} onChange={(e) => setNm({ ...nm, phone: e.target.value })} /></Field></div>
          <button disabled={busy} className={`${btnCls} mt-3`} onClick={async () => { if (await act({ action: "addMember", ...nm })) setNm({ name: "", phone: "" }); }}>Add</button>
          <p className="text-[11px] text-stone-500 mt-2">Turn order follows the order members were added. Members can join with the invite code until the first payout.</p>
        </Card>
      )}

      {c.payouts.length > 0 && (
        <Card title="Payout history">
          <ul className="text-sm divide-y divide-stone-100">{c.payouts.map((p) => <li key={p.round} className="py-2 flex justify-between"><span>Round {p.round + 1}: {c.members.find((m) => m.id === p.memberId)?.name}<span className="block text-xs text-stone-500">Ref: {p.reference}</span></span><b>{naira(p.amount)}</b></li>)}</ul>
        </Card>
      )}
    </div>
  );
}

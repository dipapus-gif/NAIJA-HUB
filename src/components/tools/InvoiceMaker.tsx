"use client";

import { Plus, Printer, MessageCircle, Trash2 } from "lucide-react";
import { Card, Field, Note, btnCls, ghostBtn, inputCls, naira, num, today, usd, useLocal, waLink } from "./kit";

interface Line { d: string; qty: string; price: string }
interface Inv { from: string; fromContact: string; to: string; toPhone: string; no: string; date: string; due: string; cur: "NGN" | "USD"; rate: string; vat: boolean; notes: string; lines: Line[] }

const INIT: Inv = { from: "", fromContact: "", to: "", toPhone: "", no: "INV-001", date: today(), due: "", cur: "NGN", rate: "1460", vat: false, notes: "Bank: \nAccount name: \nAccount number: ", lines: [{ d: "", qty: "1", price: "" }] };

export default function InvoiceMaker() {
  const [i, setI, ready] = useLocal<Inv>("nh_invoice", INIT);
  const set = (p: Partial<Inv>) => setI({ ...i, ...p });
  const setLine = (n: number, p: Partial<Line>) => set({ lines: i.lines.map((l, k) => (k === n ? { ...l, ...p } : l)) });
  const sub = i.lines.reduce((s, l) => s + num(l.qty) * num(l.price), 0);
  const vat = i.vat ? sub * 0.075 : 0;
  const total = sub + vat;
  const rate = num(i.rate);
  const fmt = (n: number) => (i.cur === "NGN" ? naira(n) : usd(n));
  const other = i.cur === "NGN" ? (rate > 0 ? usd(total / rate) : "—") : naira(total * rate);
  const text = `Invoice ${i.no} from ${i.from || "me"}\nTotal: ${fmt(total)} (about ${other})\n${i.due ? `Due: ${i.due}\n` : ""}${i.notes}`;

  return (
    <div className="space-y-4">
      <Card title="Invoice details">
        <div className="grid grid-cols-2 gap-3">
          <Field label="From (your name / business)"><input className={inputCls} value={i.from} onChange={(e) => set({ from: e.target.value })} /></Field>
          <Field label="Your contact"><input className={inputCls} value={i.fromContact} onChange={(e) => set({ fromContact: e.target.value })} placeholder="email / phone" /></Field>
          <Field label="Bill to"><input className={inputCls} value={i.to} onChange={(e) => set({ to: e.target.value })} /></Field>
          <Field label="Client WhatsApp (optional)"><input inputMode="tel" className={inputCls} value={i.toPhone} onChange={(e) => set({ toPhone: e.target.value })} placeholder="2348012345678" /></Field>
          <Field label="Invoice no."><input className={inputCls} value={i.no} onChange={(e) => set({ no: e.target.value })} /></Field>
          <Field label="Currency"><select className={inputCls} value={i.cur} onChange={(e) => set({ cur: e.target.value as Inv["cur"] })}><option value="NGN">Naira (₦)</option><option value="USD">US dollar ($)</option></select></Field>
          <Field label="Date"><input type="date" className={inputCls} value={i.date} onChange={(e) => set({ date: e.target.value })} /></Field>
          <Field label="Due date"><input type="date" className={inputCls} value={i.due} onChange={(e) => set({ due: e.target.value })} /></Field>
          <Field label="₦ per $1 (for the other-currency total)"><input inputMode="decimal" className={inputCls} value={i.rate} onChange={(e) => set({ rate: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-xs font-semibold pt-5"><input type="checkbox" className="accent-emerald-700" checked={i.vat} onChange={(e) => set({ vat: e.target.checked })} /> Add 7.5% VAT</label>
        </div>
        <h4 className="text-xs font-bold mt-5 mb-2">Items</h4>
        {i.lines.map((l, n) => (
          <div key={n} className="grid grid-cols-[1fr_4rem_6.5rem_auto] gap-2 mb-2">
            <input aria-label="Description" className={inputCls} placeholder="Description" value={l.d} onChange={(e) => setLine(n, { d: e.target.value })} />
            <input aria-label="Quantity" inputMode="decimal" className={inputCls} value={l.qty} onChange={(e) => setLine(n, { qty: e.target.value })} />
            <input aria-label="Unit price" inputMode="decimal" className={inputCls} placeholder="Price" value={l.price} onChange={(e) => setLine(n, { price: e.target.value })} />
            <button aria-label="Remove" className="text-stone-400 hover:text-rose-600 cursor-pointer" onClick={() => set({ lines: i.lines.length > 1 ? i.lines.filter((_, k) => k !== n) : i.lines })}><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button className={ghostBtn} onClick={() => set({ lines: [...i.lines, { d: "", qty: "1", price: "" }] })}><Plus className="w-3.5 h-3.5" /> Add item</button>
        <div className="mt-4"><Field label="Payment details / notes"><textarea rows={3} className={inputCls} value={i.notes} onChange={(e) => set({ notes: e.target.value })} /></Field></div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button className={btnCls} onClick={() => window.print()}><Printer className="w-4 h-4" /> Save as PDF / Print</button>
          <a className={ghostBtn} href={waLink(text, i.toPhone)} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4" /> Send summary on WhatsApp</a>
        </div>
        <Note>“Save as PDF” opens your device’s print dialog: choose “Save as PDF”, then attach the file in WhatsApp or email. The WhatsApp button sends a text summary only. VAT: charge it only if you are VAT-registered.</Note>
      </Card>

      {ready && (
        <div id="invoice-print" className="rounded-2xl bg-white text-stone-900 border border-stone-200 p-6 sm:p-8 shadow-lg">
          <div className="flex justify-between gap-4">
            <div><h2 className="font-display font-bold text-2xl text-stone-950">INVOICE</h2><p className="text-sm">{i.no}</p></div>
            <div className="text-right text-sm"><b>{i.from || "Your business"}</b><br />{i.fromContact}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
            <div><div className="text-[10px] uppercase tracking-wider text-stone-500">Bill to</div><b>{i.to || "Client"}</b></div>
            <div className="text-right"><div>Date: {i.date}</div>{i.due && <div>Due: {i.due}</div>}</div>
          </div>
          <table className="w-full text-sm mt-5">
            <thead><tr className="border-b border-stone-300 text-left text-xs text-stone-500"><th className="py-2">Description</th><th className="text-right">Qty</th><th className="text-right">Price</th><th className="text-right">Amount</th></tr></thead>
            <tbody>{i.lines.map((l, n) => <tr key={n} className="border-b border-stone-100"><td className="py-2">{l.d}</td><td className="text-right">{l.qty}</td><td className="text-right">{fmt(num(l.price))}</td><td className="text-right">{fmt(num(l.qty) * num(l.price))}</td></tr>)}</tbody>
          </table>
          <div className="mt-4 ml-auto w-full max-w-xs text-sm space-y-1">
            <div className="flex justify-between"><span>Subtotal</span><span>{fmt(sub)}</span></div>
            {i.vat && <div className="flex justify-between"><span>VAT 7.5%</span><span>{fmt(vat)}</span></div>}
            <div className="flex justify-between font-bold text-base border-t border-stone-300 pt-1"><span>Total</span><span>{fmt(total)}</span></div>
            <div className="flex justify-between text-xs text-stone-500"><span>≈ at ₦{rate.toLocaleString()}/$</span><span>{other}</span></div>
          </div>
          {i.notes.trim() && <pre className="mt-5 whitespace-pre-wrap text-xs text-stone-700 font-sans border-t border-stone-200 pt-3">{i.notes}</pre>}
        </div>
      )}
    </div>
  );
}

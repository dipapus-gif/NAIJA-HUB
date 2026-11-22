"use client";

import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Card, Field, Note, Stat, btnCls, downloadText, ghostBtn, inputCls, naira, num, toCsv, today, uid, useLocal } from "./kit";

interface Entry { id: string; date: string; kind: "sale" | "expense"; label: string; amount: number }
interface Stock { id: string; item: string; qty: number; cost: number; price: number; low: number }

export default function ShopLedger() {
  const [entries, setEntries] = useLocal<Entry[]>("nh_shop_entries", []);
  const [stock, setStock] = useLocal<Stock[]>("nh_shop_stock", []);
  const [e, setE] = useState({ date: today(), kind: "sale", label: "", amount: "" });
  const [s, setS] = useState({ item: "", qty: "", cost: "", price: "", low: "5" });
  const [tab, setTab] = useState<"ledger" | "stock">("ledger");

  const sum = (k: Entry["kind"], from: string) => entries.filter((x) => x.kind === k && x.date.startsWith(from)).reduce((a, x) => a + x.amount, 0);
  const t = today();
  const day = { sales: sum("sale", t), exp: sum("expense", t) };
  const mon = { sales: sum("sale", t.slice(0, 7)), exp: sum("expense", t.slice(0, 7)) };
  const stockValue = useMemo(() => stock.reduce((a, x) => a + x.qty * x.cost, 0), [stock]);
  const low = stock.filter((x) => x.qty <= x.low);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Sales today" value={naira(day.sales)} />
        <Stat label="Expenses today" value={naira(day.exp)} />
        <Stat label="Profit today" value={naira(day.sales - day.exp)} tone={day.sales - day.exp >= 0 ? "good" : "bad"} />
        <Stat label="Profit this month" value={naira(mon.sales - mon.exp)} tone={mon.sales - mon.exp >= 0 ? "good" : "bad"} />
      </div>
      <div className="flex gap-2">
        {(["ledger", "stock"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${tab === k ? "bg-amber-400 text-stone-950 border-amber-400" : "border-emerald-700 text-emerald-100"}`}>{k === "ledger" ? "Sales & expenses" : `Stock list${low.length ? ` (${low.length} low)` : ""}`}</button>
        ))}
      </div>

      {tab === "ledger" ? (
        <>
          <Card title="Add entry">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Date"><input type="date" className={inputCls} value={e.date} onChange={(ev) => setE({ ...e, date: ev.target.value })} /></Field>
              <Field label="Type"><select className={inputCls} value={e.kind} onChange={(ev) => setE({ ...e, kind: ev.target.value })}><option value="sale">Sale</option><option value="expense">Expense</option></select></Field>
              <Field label="Item / reason"><input className={inputCls} value={e.label} onChange={(ev) => setE({ ...e, label: ev.target.value })} placeholder="Rice (2 derica)" /></Field>
              <Field label="Amount (₦)"><input inputMode="decimal" className={inputCls} value={e.amount} onChange={(ev) => setE({ ...e, amount: ev.target.value })} /></Field>
            </div>
            <div className="flex gap-2 mt-4">
              <button className={btnCls} onClick={() => { if (num(e.amount) > 0) { setEntries([{ id: uid(), date: e.date, kind: e.kind as Entry["kind"], label: e.label.trim(), amount: num(e.amount) }, ...entries]); setE({ ...e, label: "", amount: "" }); } }}>Add</button>
              <button className={ghostBtn} onClick={() => downloadText("shop-ledger.csv", toCsv([["Date", "Type", "Item", "Amount"], ...entries.map((x) => [x.date, x.kind, x.label, x.amount])]))}><Download className="w-3.5 h-3.5" /> Export CSV</button>
            </div>
          </Card>
          <Card title={`Entries (${entries.length})`}>
            {entries.length === 0 ? <p className="text-sm text-stone-500">No entries. No signup needed; data stays on this phone.</p> : (
              <ul className="divide-y divide-stone-100 text-sm">
                {entries.slice(0, 60).map((x) => (
                  <li key={x.id} className="py-2 flex justify-between gap-2">
                    <span>{x.date} · {x.label || x.kind}</span>
                    <span className={`font-semibold flex items-center gap-2 ${x.kind === "sale" ? "text-emerald-700" : "text-rose-700"}`}>{x.kind === "sale" ? "+" : "−"}{naira(x.amount)}
                      <button aria-label="Delete" className="text-stone-400 hover:text-rose-600 cursor-pointer" onClick={() => setEntries(entries.filter((y) => y.id !== x.id))}><Trash2 className="w-4 h-4" /></button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : (
        <>
          <Card title="Add stock item">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Field label="Item"><input className={inputCls} value={s.item} onChange={(ev) => setS({ ...s, item: ev.target.value })} /></Field>
              <Field label="Qty"><input inputMode="numeric" className={inputCls} value={s.qty} onChange={(ev) => setS({ ...s, qty: ev.target.value })} /></Field>
              <Field label="Cost each (₦)"><input inputMode="decimal" className={inputCls} value={s.cost} onChange={(ev) => setS({ ...s, cost: ev.target.value })} /></Field>
              <Field label="Sell each (₦)"><input inputMode="decimal" className={inputCls} value={s.price} onChange={(ev) => setS({ ...s, price: ev.target.value })} /></Field>
              <Field label="Low at"><input inputMode="numeric" className={inputCls} value={s.low} onChange={(ev) => setS({ ...s, low: ev.target.value })} /></Field>
            </div>
            <button className={`${btnCls} mt-4`} onClick={() => { if (s.item.trim()) { setStock([{ id: uid(), item: s.item.trim(), qty: num(s.qty), cost: num(s.cost), price: num(s.price), low: num(s.low) }, ...stock]); setS({ item: "", qty: "", cost: "", price: "", low: s.low }); } }}>Add</button>
          </Card>
          <Card title={`Stock (${stock.length}) · cost value ${naira(stockValue)}`}>
            {stock.length === 0 ? <p className="text-sm text-stone-500">No stock added yet.</p> : (
              <ul className="divide-y divide-stone-100 text-sm">
                {stock.map((x) => (
                  <li key={x.id} className="py-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold">{x.item} {x.qty <= x.low && <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full ml-1">LOW</span>}</div>
                      <div className="text-xs text-stone-500">Cost {naira(x.cost)} · sell {naira(x.price)} · margin {naira(x.price - x.cost)}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button aria-label="Sold one" className={ghostBtn} onClick={() => setStock(stock.map((y) => (y.id === x.id ? { ...y, qty: Math.max(0, y.qty - 1) } : y)))}>−1</button>
                      <span className="w-8 text-center font-bold">{x.qty}</span>
                      <button aria-label="Add one" className={ghostBtn} onClick={() => setStock(stock.map((y) => (y.id === x.id ? { ...y, qty: y.qty + 1 } : y)))}>+1</button>
                      <button aria-label="Delete" className="text-stone-400 hover:text-rose-600 cursor-pointer ml-1" onClick={() => setStock(stock.filter((y) => y.id !== x.id))}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
      <Note>Profit here is sales minus expenses you logged. It does not include rent, tax or goods bought before you started logging.</Note>
    </div>
  );
}

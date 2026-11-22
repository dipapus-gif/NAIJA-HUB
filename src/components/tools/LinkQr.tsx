"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { Card, Field, Note, btnCls, ghostBtn, inputCls, waLink } from "./kit";

function normalise(p: string) {
  const d = p.replace(/\D/g, "");
  if (d.startsWith("234")) return d;
  if (d.startsWith("0")) return "234" + d.slice(1);
  return d;
}

function QrView({ value, name }: { value: string; name: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let live = true;
    if (!value) {
      setSrc("");
      return;
    }
    QRCode.toDataURL(value, { width: 320, margin: 2, errorCorrectionLevel: "M" }).then((u) => live && setSrc(u)).catch(() => live && setSrc(""));
    return () => {
      live = false;
    };
  }, [value]);
  if (!src) return null;
  return (
    <div className="mt-4 flex flex-col items-center gap-3">
      <img src={src} alt="QR code" width={220} height={220} className="rounded-xl border border-stone-200 bg-white" />
      <a className={ghostBtn} href={src} download={`${name}.png`}><Download className="w-3.5 h-3.5" /> Download PNG</a>
    </div>
  );
}

export default function LinkQr() {
  const [mode, setMode] = useState<"wa" | "pay" | "text">("wa");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("Hello, I am interested in your product.");
  const [pay, setPay] = useState({ name: "", bank: "", acct: "", amount: "", note: "" });
  const [text, setText] = useState("");
  const wa = phone ? waLink(msg, normalise(phone)) : "";
  const payText = pay.acct ? `Pay ${pay.name}\nBank: ${pay.bank}\nAccount: ${pay.acct}${pay.amount ? `\nAmount: ₦${pay.amount}` : ""}${pay.note ? `\nNote: ${pay.note}` : ""}` : "";

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {([["wa", "WhatsApp link"], ["pay", "Payment details QR"], ["text", "Any text / link"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)} className={`px-3.5 py-1.5 rounded-full text-xs font-bold border cursor-pointer ${mode === k ? "bg-amber-400 text-stone-950 border-amber-400" : "border-emerald-700 text-emerald-100"}`}>{l}</button>
        ))}
      </div>
      <Card>
        {mode === "wa" && (
          <>
            <div className="grid gap-3">
              <Field label="WhatsApp number" hint="0803… or 234803… both work"><input inputMode="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
              <Field label="Pre-filled message"><textarea rows={3} className={inputCls} value={msg} onChange={(e) => setMsg(e.target.value)} /></Field>
            </div>
            {wa && (
              <>
                <p className="mt-3 text-xs break-all rounded-lg bg-stone-100 p-2.5">{wa}</p>
                <div className="flex gap-2 mt-2"><button className={btnCls} onClick={() => navigator.clipboard?.writeText(wa).catch(() => {})}>Copy link</button><a className={ghostBtn} href={wa} target="_blank" rel="noopener noreferrer">Test it</a></div>
                <QrView value={wa} name="whatsapp-chat" />
              </>
            )}
          </>
        )}
        {mode === "pay" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Account name"><input className={inputCls} value={pay.name} onChange={(e) => setPay({ ...pay, name: e.target.value })} /></Field>
              <Field label="Bank"><input className={inputCls} value={pay.bank} onChange={(e) => setPay({ ...pay, bank: e.target.value })} /></Field>
              <Field label="Account number"><input inputMode="numeric" className={inputCls} value={pay.acct} onChange={(e) => setPay({ ...pay, acct: e.target.value })} /></Field>
              <Field label="Amount (optional)"><input inputMode="decimal" className={inputCls} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></Field>
            </div>
            <QrView value={payText} name="payment-details" />
            <Note>This QR holds your bank details as plain text so a customer can read them. It is <b>not</b> a bank-scannable (NQR) code, so banking apps will not pay from it. For that, create a code in your bank or POS app.</Note>
          </>
        )}
        {mode === "text" && (
          <>
            <Field label="Text or URL"><textarea rows={3} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} /></Field>
            <QrView value={text} name="qr-code" />
          </>
        )}
      </Card>
    </div>
  );
}

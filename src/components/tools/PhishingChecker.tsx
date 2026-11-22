"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, Note, inputCls } from "./kit";

const BRANDS = ["gtbank", "gtco", "access", "zenith", "firstbank", "uba", "opay", "palmpay", "moniepoint", "kuda", "fcmb", "sterling", "wema", "stanbic", "fidelity", "paystack", "flutterwave", "cbn", "nimc", "jamb", "frsc", "ikedc", "ekedc", "mtn", "airtel", "dstv", "paypal", "whatsapp"];
const BAD_TLDS = ["xyz", "top", "click", "icu", "live", "vip", "cc", "tk", "ml", "ga", "cf", "gq", "site", "online", "buzz", "rest", "work", "monster", "cfd", "sbs"];
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "rb.gy", "is.gd", "shorturl.at", "ow.ly", "wa.me"];
const WORDS = ["login", "signin", "verify", "update", "secure", "account", "bvn", "otp", "claim", "bonus", "free", "reward", "suspend", "unlock", "kyc", "confirm", "refund", "winner"];

interface Flag { w: number; t: string }

function check(raw: string): { host: string; flags: Flag[]; ok: boolean } {
  let s = raw.trim();
  if (!s) return { host: "", flags: [], ok: false };
  const flags: Flag[] = [];
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
    flags.push({ w: 0, t: "No https:// at the start, so we assumed one for checking." });
    s = "http://" + s;
  }
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return { host: "", flags: [{ w: 100, t: "This is not a valid web address." }], ok: false };
  }
  const host = u.hostname.toLowerCase();
  const parts = host.split(".");
  if (u.protocol !== "https:") flags.push({ w: 25, t: "Not using HTTPS: login or payment pages should always be secure." });
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) flags.push({ w: 40, t: "Uses a raw IP address instead of a name." });
  if (host.includes("xn--")) flags.push({ w: 40, t: "Contains look-alike (punycode) characters that can imitate real letters." });
  if (u.username || s.replace(/^[a-z]+:\/\//i, "").split("/")[0].includes("@")) flags.push({ w: 40, t: "Has an “@” in the address, a trick to hide the real site." });
  if (parts.length > 4) flags.push({ w: 20, t: "Many sub-domains: the real site is the last two parts, not the first." });
  if (/[a-z]-[a-z]/.test(parts[parts.length - 2] ?? "") ) flags.push({ w: 15, t: "Hyphens in the main name are common in fake sites." });
  if (/(rn|vv)/.test(parts[parts.length - 2] ?? "") || /[a-z][01][a-z]/.test(parts[parts.length - 2] ?? "")) flags.push({ w: 20, t: "Letters may be swapped with look-alikes (rn for m, 0 for o, 1 for l)." });
  const tld = parts[parts.length - 1];
  if (BAD_TLDS.includes(tld)) flags.push({ w: 25, t: `“.${tld}” endings are cheap and often used for scams. Banks normally use .com, .ng or .com.ng.` });
  if (SHORTENERS.includes(host)) flags.push({ w: 30, t: "Shortened link: you cannot see where it goes. Do not enter details on it." });
  const base = parts.slice(-2).join(".");
  const brand = BRANDS.find((b) => host.includes(b));
  if (brand) flags.push({ w: 20, t: `The name “${brand}” appears in the address. Confirm it is exactly the domain printed on your card, in the official app or on the bank’s verified page.` });
  const word = WORDS.find((x) => (host + u.pathname).toLowerCase().includes(x));
  if (word) flags.push({ w: 15, t: `Urgent or account-style word “${word}” in the address.` });
  if (host.length > 40) flags.push({ w: 10, t: "Unusually long address." });
  return { host: base, flags, ok: true };
}

export default function PhishingChecker() {
  const [url, setUrl] = useState("");
  const r = useMemo(() => check(url), [url]);
  const score = Math.min(100, r.flags.reduce((a, f) => a + f.w, 0));
  const level = score >= 50 ? "high" : score >= 20 ? "medium" : "low";
  const real = r.flags.filter((f) => f.w > 0);

  return (
    <div className="space-y-4">
      <Card title="Check a link before you tap it">
        <input aria-label="Link" className={inputCls} placeholder="Paste the link, e.g. gtbank-secure-login.xyz/verify" value={url} onChange={(e) => setUrl(e.target.value)} />
        {r.ok && (
          <div className={`mt-4 rounded-xl p-4 border ${level === "high" ? "border-rose-300 bg-rose-50" : level === "medium" ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}`}>
            <div className="flex items-center gap-2 font-display font-bold text-stone-950">
              {level === "low" ? <ShieldCheck className="w-5 h-5 text-emerald-700" /> : <ShieldAlert className="w-5 h-5 text-rose-700" />}
              {level === "high" ? "Likely a scam: do not enter any details" : level === "medium" ? "Suspicious: be careful" : "No obvious red flags"} <span className="text-xs font-normal text-stone-500">({score}/100)</span>
            </div>
            <p className="text-xs mt-1 text-stone-700">Site: <b>{r.host}</b></p>
            <ul className="mt-3 list-disc pl-5 text-sm space-y-1">{real.map((f) => <li key={f.t}>{f.t}</li>)}{real.length === 0 && <li>Nothing matched our simple rules.</li>}</ul>
          </div>
        )}
        <Note>These are simple pattern rules, not a database of known scams, so a clean result does not prove a site is safe. Never share your OTP, PIN or BVN; open your bank’s official app or type its address yourself instead of tapping links in SMS, WhatsApp or email.</Note>
      </Card>
    </div>
  );
}

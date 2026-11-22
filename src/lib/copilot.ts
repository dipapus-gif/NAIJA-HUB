import { OFFLINE_CODES } from "./i18n";
import { calcNigeriaVat, evaluateScamRisk } from "./calculations";

export const COPILOT_SYSTEM_PROMPT = `You are Naija Hub Co-pilot, a friendly assistant inside an offline-first Nigerian utilities app.
The app has: Light Tracker (NEPA/DisCo status, token cost per kWh), Fuel & Energy (petrol/diesel/gas, generator vs grid), Price Watch (crowd-sourced staples), Naira Rates (reference vs street), Tax & VAT (PAYE, 7.5% VAT), Split the Bill, Ajo/Esusu, Bill Reminders, USSD & Emergency codes, Scam & NAFDAC check.
Reply in the user's language: plain English or Nigerian Pidgin if they write Pidgin. Be concise (under 120 words), practical, and use Naira (₦). 
Never claim live data you were not given. You are not a financial, legal, tax or medical advisor; for those, give general info and suggest confirming with the proper authority. For emergencies tell the user to dial 112. Never ask for passwords, PINs, BVN or card numbers.`;

const fmt = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");

export function localCopilotReply(message: string): string {
  const m = message.toLowerCase();
  const pidgin = /\b(abeg|wetin|how far|dey|una|na\b|wahala|sabi|pikin)\b/.test(m);

  // VAT maths: "vat on 25000" / "remove vat from 107500"
  const amountMatch = m.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(k\b)?/);
  const amount = amountMatch ? Number(amountMatch[1]) * (amountMatch[2] ? 1000 : 1) : null;
  if (/\bvat\b/.test(m) && amount) {
    if (/(remove|extract|inclusive|include|from)/.test(m)) {
      const r = calcNigeriaVat(amount, "EXTRACT_VAT");
      return `${fmt(amount)} with 7.5% VAT inside: net ${fmt(r.netAmount)}, VAT ${fmt(r.vatAmount)}.`;
    }
    const r = calcNigeriaVat(amount, "ADD_VAT");
    return `Adding 7.5% VAT to ${fmt(amount)}: VAT ${fmt(r.vatAmount)}, total ${fmt(r.grossTotal)}. Use the Tax & VAT tool for PAYE too.`;
  }

  if (/(split|share).*(bill|food|cost)|bill.*split/.test(m) && amount) {
    const n = Number(m.match(/(\d+)\s*(people|persons|of us|ways)/)?.[1] ?? 0);
    if (n > 1) return `${fmt(amount)} split ${n} ways is ${fmt(amount / n)} each (before tip/VAT). The Split the Bill tool handles unequal orders.`;
  }

  if (/(scam|fraud|fake|419|otp|phish|suspicious)/.test(m)) {
    const risk = evaluateScamRisk([], message);
    const base = pidgin
      ? "Abeg no share OTP, PIN or BVN with anybody — real banks no dey ask. If person dey rush you to pay, na red flag."
      : "Never share your OTP, PIN or BVN — real banks never ask. Urgency, 'you won' prizes and requests to pay first are red flags.";
    const extra = risk && typeof risk === "object" && "matchedReasons" in risk && (risk as { matchedReasons: string[] }).matchedReasons.length
      ? ` Your message looks risky: ${(risk as { matchedReasons: string[] }).matchedReasons.slice(0, 2).join("; ")}.`
      : "";
    return `${base}${extra} Open the Scam Check tool to score a message, and verify products on NAFDAC Greenbook (SMS MAS PIN to 38353).`;
  }

  if (/(nafdac|drug|medicine|fake product|verify product)/.test(m))
    return "Check the NAFDAC number in the Scam & NAFDAC tool. Also scratch the MAS label and SMS the PIN to 38353. If a product is flagged or you feel sick after using it, report to NAFDAC and see a pharmacist or doctor.";

  if (/(emergency|police|fire|ambulance|accident|help me)/.test(m))
    return "Emergency? Dial 112 (national emergency line) now. Open the USSD & Emergency tab for more codes that work without data.";

  const ussd = OFFLINE_CODES.filter((c) => {
    const hay = `${c.provider} ${c.titleEn} ${c.noteEn}`.toLowerCase();
    return m.split(/\W+/).some((w) => w.length > 2 && hay.includes(w) && !["the", "for", "and", "code", "ussd", "how", "use"].includes(w));
  }).slice(0, 4);
  if (/(ussd|code|dial|\*\d+#|balance|airtime)/.test(m) && ussd.length)
    return "Codes that work without data:\n" + ussd.map((c) => `• ${c.provider}: ${c.code} — ${c.noteEn}`).join("\n");

  if (/(light|nepa|nepa|disco|token|power|band [abcde])/.test(m))
    return "In Light Tracker log when power goes on/off to see daily hours and your real cost per kWh from token purchases. Community reports show live status per area; compare Band A–E to what your DisCo bills. Tip: buy tokens when you can see your meter number match the receipt.";

  if (/(petrol|diesel|fuel|gas|generator|gen\b)/.test(m))
    return "Fuel & Energy compares generator vs grid cost per hour and estimates trip fuel. Enter today's pump price from Price Watch for an accurate result. Running a gen costs far more per kWh than Band A power — check before you fuel up.";

  if (/(rate|dollar|usd|naira|exchange|forex|fx|gbp|euro)/.test(m))
    return "Naira Rates shows the official reference rate and lets you switch to your own street rate to convert USD, GBP and EUR. Rates move daily, so confirm with your bank or bureau de change before big transfers.";

  if (/(paye|income tax|salary|tax)/.test(m))
    return "The Tax & VAT tool estimates PAYE from gross pay (with pension and relief inputs) and adds or removes 7.5% VAT. These are estimates — confirm with your employer or FIRS.";

  if (/(ajo|esusu|thrift|contribution|savings group)/.test(m))
    return "Ajo/Esusu tracks your group, contribution amount, rounds and who collects next. Only join groups with people you know and keep written records of each payout.";

  if (/(bill|reminder|due|dstv|subscription|rent)/.test(m))
    return "Bill Reminders lets you add electricity, cable, internet, water and levy bills with due days, and mark each paid for the month. Add the beneficiary number once and reuse it.";

  if (/(offline|data|install|app|download|desktop|pwa)/.test(m))
    return "Naija Hub works offline once loaded: your personal data stays on your device. Tap Install in the top bar to add it to your phone or desktop, or use the desktop app build.";

  if (/(hello|hi\b|hey|how far|good (morning|afternoon|evening))/.test(m))
    return pidgin
      ? "How far! I be Naija Hub Co-pilot. Ask me about light, fuel, prices, tax, bill split, USSD codes or scam check."
      : "Hello! I'm the Naija Hub Co-pilot. Ask me about light, fuel, prices, naira rates, tax/VAT, splitting bills, USSD codes or spotting scams.";

  return pidgin
    ? "I fit help with light, fuel, prices, naira rate, tax/VAT, bill split, USSD codes and scam check. Try: “vat on 25000” or “wetin be GTBank code”."
    : "I can help with the 10 tools: light, fuel, prices, naira rates, tax/VAT, bill splitting, Ajo, reminders, USSD codes and scam checks. Try “VAT on 25000” or “GTBank USSD code”.";
}

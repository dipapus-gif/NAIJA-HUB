"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { Card, Note, inputCls } from "./kit";

const LANGS = [
  { k: "en", l: "English", bcp: "en-NG" },
  { k: "pcm", l: "Pidgin", bcp: "en-NG" },
  { k: "yo", l: "Yorùbá", bcp: "yo-NG" },
  { k: "ha", l: "Hausa", bcp: "ha-NG" },
  { k: "ig", l: "Igbo", bcp: "ig-NG" },
] as const;
type K = (typeof LANGS)[number]["k"];

const PHRASES: Record<K, string>[] = [
  { en: "Hello", pcm: "How you dey?", yo: "Ẹ nlẹ́ o", ha: "Sannu", ig: "Ndewo" },
  { en: "Good morning", pcm: "Good morning", yo: "Ẹ káàárọ̀", ha: "Ina kwana", ig: "Ụtụtụ ọma" },
  { en: "Thank you", pcm: "Thank you well well", yo: "Ẹ ṣé", ha: "Na gode", ig: "Daalụ" },
  { en: "Please", pcm: "Abeg", yo: "Ẹ jọ̀wọ́", ha: "Don Allah", ig: "Biko" },
  { en: "Welcome", pcm: "You're welcome", yo: "Ẹ káàbọ̀", ha: "Barka da zuwa", ig: "Nnọọ" },
  { en: "Yes / No", pcm: "Yes / No", yo: "Bẹ́ẹ̀ ni / Rárá", ha: "Eh / A'a", ig: "Ee / Mba" },
  { en: "How much is this?", pcm: "How much be dis one?", yo: "Èló ni èyí?", ha: "Nawa ne wannan?", ig: "Ego ole ka nke a bụ?" },
  { en: "It is too expensive, reduce it a little", pcm: "E too cost, abeg reduce small", yo: "Ó wọ́n jù, ẹ dín in kù díẹ̀", ha: "Yana da tsada, ka rage kaɗan", ig: "O dị oke ọnụ, biko belata ntakịrị" },
  { en: "I do not understand", pcm: "I no understand", yo: "Kò yé mi", ha: "Ban gane ba", ig: "Aghọtaghị m" },
  { en: "I need help", pcm: "Abeg help me", yo: "Mo nílò ìrànlọ́wọ́", ha: "Ina bukatar taimako", ig: "Achọrọ m enyemaka" },
  { en: "Where is the hospital?", pcm: "Where hospital dey?", yo: "Níbo ni ilé ìwòsàn wà?", ha: "Ina asibiti yake?", ig: "Ebee ka ụlọ ọgwụ dị?" },
  { en: "I am not feeling well", pcm: "Body no dey fine", yo: "Ara mi kò yá", ha: "Ba na jin daɗi", ig: "Ahụ adịghị m mma" },
  { en: "Water, please", pcm: "Abeg, water", yo: "Omi, ẹ jọ̀wọ́", ha: "Ruwa, don Allah", ig: "Mmiri, biko" },
  { en: "Call the police", pcm: "Call police", yo: "Ẹ pe ọlọ́pàá", ha: "A kira 'yan sanda", ig: "Kpọọ ndị uweojii" },
];

export default function Phrasebook() {
  const [from, setFrom] = useState<K>("en");
  const [to, setTo] = useState<K>("yo");
  const [q, setQ] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const hasVoice = (bcp: string) => voices.some((v) => v.lang.toLowerCase().startsWith(bcp.slice(0, 2)));
  const speak = (text: string, k: K) => {
    if (!supported) return;
    const lang = LANGS.find((x) => x.k === k)!.bcp;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const v = voices.find((x) => x.lang.toLowerCase().replace("_", "-") === lang.toLowerCase()) ?? voices.find((x) => x.lang.toLowerCase().startsWith(lang.slice(0, 2)));
    if (v) u.voice = v;
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const rows = PHRASES.filter((p) => !q || Object.values(p).some((x) => x.toLowerCase().includes(q.toLowerCase())));
  const toBcp = LANGS.find((x) => x.k === to)!.bcp;

  return (
    <div className="space-y-4">
      <Card title="Phrasebook with voice">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <select aria-label="From" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value as K)}>{LANGS.map((l) => <option key={l.k} value={l.k}>{l.l}</option>)}</select>
          <select aria-label="To" className={inputCls} value={to} onChange={(e) => setTo(e.target.value as K)}>{LANGS.map((l) => <option key={l.k} value={l.k}>{l.l}</option>)}</select>
          <input aria-label="Search" className={inputCls} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {supported && voices.length > 0 && !hasVoice(toBcp) && <p className="text-xs rounded-lg bg-amber-50 text-amber-900 border border-amber-200 p-2.5 mb-3">Your device has no {LANGS.find((x) => x.k === to)!.l} voice installed, so it will read the phrase with a default voice and the pronunciation may be off. Install a voice in your phone’s text-to-speech settings, or learn it by ear from a native speaker.</p>}
        {!supported && <p className="text-xs rounded-lg bg-amber-50 text-amber-900 border border-amber-200 p-2.5 mb-3">This browser does not support text-to-speech.</p>}
        <ul className="divide-y divide-stone-100">
          {rows.map((p) => (
            <li key={p.en} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-stone-500">{p[from]}</div>
                <div className="font-display font-bold text-lg text-stone-950">{p[to]}</div>
              </div>
              <button aria-label={`Speak: ${p[to]}`} onClick={() => speak(p[to], to)} className="shrink-0 w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center hover:bg-emerald-600 cursor-pointer"><Volume2 className="w-4 h-4" /></button>
            </li>
          ))}
          {rows.length === 0 && <li className="py-4 text-sm text-stone-500">No phrase found.</li>}
        </ul>
        <Note>This is a hand-written phrasebook of common phrases, not a machine translator, so it cannot translate new sentences. Wording and tone marks vary by region and speaker; please have a native speaker confirm anything important.</Note>
      </Card>
    </div>
  );
}

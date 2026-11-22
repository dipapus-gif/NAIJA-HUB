"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = ["VAT on 25000", "GTBank USSD code", "How do I spot a scam?", "Generator vs NEPA cost"];
const GREETING: Msg = {
  role: "assistant",
  content: "Hi! I'm your Naija Hub Co-pilot. Ask about light, fuel, prices, tax, bill splitting, USSD codes or scams. Abeg, no share OTP or PIN here.",
};

export function Copilot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...msgs, { role: "user" as const, content }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = await res.json();
      setMsgs([...next, { role: "assistant", content: data.reply || "Sorry, I couldn't answer that." }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "You seem to be offline. Try again when data returns — the tools still work offline." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open AI co-pilot"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-amber-400 text-stone-950 font-bold text-sm shadow-xl shadow-black/30 hover:bg-amber-300 transition cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> Co-pilot
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label="Naija Hub AI co-pilot"
          className="fixed z-50 bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[380px] h-[75vh] sm:h-[520px] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden border border-emerald-800 bg-[#0a251c] text-stone-100 shadow-2xl shadow-black/50"
        >
          <header className="flex items-center justify-between px-4 py-3 bg-emerald-950 border-b border-emerald-800">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center"><Bot className="w-4 h-4" /></span>
              <div>
                <div className="font-display font-bold text-sm leading-none">Naija Hub Co-pilot</div>
                <div className="text-[10px] text-emerald-300 font-mono mt-0.5">EN · PIDGIN</div>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close co-pilot" className="text-emerald-200 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-amber-400 text-stone-950 rounded-br-sm" : "bg-emerald-900 text-emerald-50 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start"><div className="bg-emerald-900 rounded-2xl px-3.5 py-2"><Loader2 className="w-4 h-4 animate-spin text-amber-300" /></div></div>
            )}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-emerald-700 text-emerald-100 hover:border-amber-400 hover:text-amber-300 cursor-pointer">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 p-3 border-t border-emerald-800 bg-emerald-950">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              maxLength={500}
              className="flex-1 rounded-full bg-[#0a251c] border border-emerald-800 px-4 py-2 text-sm text-white placeholder:text-emerald-300/60 outline-none focus:border-amber-400"
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="w-9 h-9 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center disabled:opacity-40 cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}

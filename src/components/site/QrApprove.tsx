"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

export function QrApprove({ code, name }: { code: string; name: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const approve = async () => {
    setState("busy");
    try {
      const res = await fetch(`/api/auth/qr/${code}/approve`, { method: "POST" });
      const d = await res.json();
      if (d.ok) setState("done");
      else {
        setMsg(d.error || "Could not approve.");
        setState("error");
      }
    } catch {
      setMsg("Network problem. Try again.");
      setState("error");
    }
  };

  if (state === "done")
    return (
      <div className="text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
        <h1 className="font-display font-bold text-xl mt-3">Approved</h1>
        <p className="text-sm text-stone-600 mt-1">Your other device is now logged in as {name}.</p>
        <Link href="/" className="inline-block mt-5 text-sm font-semibold text-emerald-800 underline">Back to Naija Hub</Link>
      </div>
    );

  return (
    <div className="text-center">
      <h1 className="font-display font-bold text-xl">Log in on another device?</h1>
      <p className="text-sm text-stone-600 mt-2">
        Approve only if you just scanned this code from your own screen. This will log that device in as <strong>{name}</strong>.
      </p>
      {state === "error" && <p role="alert" className="mt-3 text-xs text-rose-700">{msg}</p>}
      <button
        type="button"
        onClick={approve}
        disabled={state === "busy"}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm py-3 cursor-pointer"
      >
        {state === "busy" && <Loader2 className="w-4 h-4 animate-spin" />} Approve login
      </button>
      <Link href="/" className="inline-block mt-3 text-xs text-stone-600 underline">Cancel</Link>
    </div>
  );
}

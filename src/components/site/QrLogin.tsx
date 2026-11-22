"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { Loader2, RefreshCw, Smartphone } from "lucide-react";

export function QrLogin() {
  const router = useRouter();
  const [img, setImg] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "expired" | "error">("loading");
  const session = useRef<{ code: string; secret: string } | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  const start = useCallback(async () => {
    stop();
    setState("loading");
    try {
      const res = await fetch("/api/auth/qr", { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error("create failed");
      session.current = { code: data.code, secret: data.secret };
      setImg(
        await QRCode.toDataURL(`${window.location.origin}/qr/${data.code}`, {
          margin: 1,
          width: 360,
          color: { dark: "#044E36", light: "#ffffff" },
        })
      );
      setState("ready");
      timer.current = setInterval(async () => {
        const s = session.current;
        if (!s) return;
        try {
          const r = await fetch(`/api/auth/qr/${s.code}?secret=${encodeURIComponent(s.secret)}`, { cache: "no-store" });
          const d = await r.json();
          if (d.status === "approved") {
            stop();
            router.push("/");
            router.refresh();
          } else if (d.status === "expired" || d.status === "invalid") {
            stop();
            setState("expired");
          }
        } catch {
          /* transient network error: keep polling */
        }
      }, 2000);
    } catch {
      setState("error");
    }
  }, [router]);

  useEffect(() => {
    start();
    return stop;
  }, [start]);

  return (
    <div className="mt-6 pt-6 border-t border-stone-200 text-center">
      <p className="flex items-center justify-center gap-2 text-xs font-semibold text-stone-700">
        <Smartphone className="w-4 h-4 text-emerald-800" /> Or log in with your phone
      </p>
      <div className="relative mx-auto mt-3 w-44 h-44 rounded-xl border border-stone-200 bg-white p-1.5 flex items-center justify-center">
        {state === "ready" && img && <img src={img} alt="QR code to log in" className="w-full h-full" />}
        {state === "loading" && <Loader2 className="w-6 h-6 animate-spin text-emerald-800" />}
        {(state === "expired" || state === "error") && (
          <button type="button" onClick={start} className="flex flex-col items-center gap-1 text-xs font-semibold text-emerald-800 cursor-pointer">
            <RefreshCw className="w-5 h-5" />
            {state === "expired" ? "Expired — tap to refresh" : "Couldn’t load — retry"}
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-stone-500 leading-relaxed">
        Open Naija Hub on a phone where you’re already logged in, scan this code with the camera and tap Approve.
      </p>
    </div>
  );
}

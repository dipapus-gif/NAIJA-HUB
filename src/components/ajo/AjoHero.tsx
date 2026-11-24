"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useLang } from "@/lib/useLang";
import { pick } from "@/lib/i18n";

const SRC = "/videos/ajo-gathering.mp4";
const POSTER = "/images/ajo-gathering-poster.jpg";

/**
 * Ajo banner with a looping community clip. The still poster shows at once, the video fades in when it can
 * play, and it only decodes while the banner is on screen, so scrolling stays smooth on phones and desktop.
 */
export function AjoHero() {
  const [lang] = useLang();
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [ok, setOk] = useState(false); // allowed to play (motion + data-saver aware)
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOk(!reduce && !nav.connection?.saveData);
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = vid.current;
    if (!v || !ok) return;
    const run = () => (visible && !paused && !document.hidden ? v.play().catch(() => {}) : v.pause());
    run();
    document.addEventListener("visibilitychange", run);
    return () => document.removeEventListener("visibilitychange", run);
  }, [visible, paused, ok]);

  return (
    <div ref={box} className="relative overflow-hidden rounded-2xl border border-emerald-900/70 bg-[#04120e] mb-5 aspect-[16/10] sm:aspect-[21/8]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={POSTER} alt="" className="absolute inset-0 w-full h-full object-cover" />
      {ok && (
        <video
          ref={vid}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0, transform: "translateZ(0)" }}
          muted
          loop
          playsInline
          preload={visible ? "auto" : "none"}
          poster={POSTER}
          onCanPlay={() => setReady(true)}
          aria-hidden="true"
        >
          <source src={SRC} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#04120e] via-[#04120e]/45 to-transparent" />
      <div className="absolute left-0 right-0 bottom-0 p-4 sm:p-6">
        <p className="text-[11px] tracking-[0.2em] text-amber-300 font-semibold">AJO · ESUSU</p>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-1">
          {pick(lang, "Save together. Collect in turn.", "Save together. Collect your turn.", "Ẹ jọ fi owó pamọ́. Ẹ gbà ní ìgbà yín.", "Mu yi ajiya tare. Ka karɓa a lokacinka.", "Gbakwunyere ego ọnụ. Nata n'oge gị.")}
        </h2>
      </div>
      {ok && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play video" : "Pause video"}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/45 backdrop-blur text-white grid place-items-center hover:bg-black/60"
        >
          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

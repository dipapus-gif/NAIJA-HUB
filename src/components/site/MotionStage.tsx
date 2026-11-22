"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown, Pause, Play } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { videoSources } from "@/lib/videoSources";

interface Chapter {
  video: string;
  poster: string;
  utility: string;
  en: { title: string; body: string };
  pcm: { title: string; body: string };
}

const CHAPTERS: Chapter[] = [
  {
    video: "https://videos.pexels.com/video-files/29103994/12573651_3840_2160_30fps.mp4",
    poster: "/images/story-dawn-commute.jpg",
    utility: "light",
    en: { title: "Know before you go", body: "Live light status, flood alerts and fares for Lagos, Abuja, Port Harcourt and Kano — before you step outside." },
    pcm: { title: "Sabi before you waka", body: "See if light dey, where flood dey and how much transport be — before you commot house." },
  },
  {
    video: "https://videos.pexels.com/video-files/27165160/12087844_3840_2160_25fps.mp4",
    poster: "/images/story-market-fuel.jpg",
    utility: "price",
    en: { title: "Prices, made fair", body: "Crowd-sourced petrol, gas and market prices, plus the real cost of running your generator against the grid." },
    pcm: { title: "Price wey make sense", body: "Fuel, gas and market price from people for ground, plus how much your generator dey chop." },
  },
  {
    video: "https://videos.pexels.com/video-files/27706410/12209725_3840_2160_25fps.mp4",
    poster: "/images/story-verify-shield.jpg",
    utility: "scam",
    en: { title: "Scam-proof by design", body: "Check NAFDAC numbers, score suspicious messages and keep a blocklist — all without leaving the app." },
    pcm: { title: "No let them 419 you", body: "Check NAFDAC number, score strange message and block fraud people — for one place." },
  },
  {
    video: "https://videos.pexels.com/video-files/853772/853772-hd_1920_1080_25fps.mp4",
    poster: "/images/story-up-nepa.jpg",
    utility: "tax",
    en: { title: "Naira, tax and bills", body: "Convert at the street or official rate, work out PAYE and VAT, split the bill and never miss a due date." },
    pcm: { title: "Naira, tax and bill", body: "Change dollar at street or bank rate, calculate PAYE and VAT, share bill and remember due date." },
  },
  {
    video: "https://videos.pexels.com/video-files/28925673/12518915_3840_2160_30fps.mp4",
    poster: "/images/story-ajo-esusu.jpg",
    utility: "ajo",
    en: { title: "Ajo, tracked honestly", body: "Run your esusu circle with clear rounds, payouts and records everybody can trust." },
    pcm: { title: "Ajo wey clear", body: "Run your esusu with correct round, payout and record wey everybody go trust." },
  },
];

const CHIPS = ["LIGHT", "FUEL", "NAIRA", "AJO", "SCAM-SAFE", "OFFLINE"];

export function MotionStage({ lang, onJump }: { lang: Lang; onJump: (utility: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const total = CHAPTERS.length + 1; // + finale
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const drift = useTransform(smooth, [0, 1], ["0%", "-6%"]);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(total - 1, Math.max(0, Math.floor(v * total))));
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }, []);

  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (playing && Math.abs(i - Math.min(active, CHAPTERS.length - 1)) <= 1) v.play().catch(() => {});
      else v.pause();
    });
  }, [active, playing]);

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + (span * (i + 0.5)) / total, behavior: "smooth" });
  };

  const finale = active === CHAPTERS.length;
  const ch = CHAPTERS[Math.min(active, CHAPTERS.length - 1)];
  const copy = lang === "en" ? ch.en : ch.pcm;
  const num = String(active + 1).padStart(2, "0");

  return (
    <div ref={ref} className="relative" style={{ height: `${total * 85}vh` }} id="motion">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden bg-[#061A14]">
        {/* Visual layer: every chapter keeps its own video; neighbours of the active one play so cross-fades stay in motion */}
        <motion.div aria-hidden className="absolute inset-0 will-change-transform" style={{ y: drift }}>
          {CHAPTERS.map((c, i) => {
            const cur = Math.min(active, CHAPTERS.length - 1);
            const live = Math.abs(i - cur) <= 1;
            return (
              <div
                key={c.video}
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{ opacity: i === cur ? 1 : 0 }}
              >
                <video
                  ref={(el) => {
                    videos.current[i] = el;
                  }}
                  poster={c.poster}
                  muted
                  loop
                  playsInline
                  disablePictureInPicture
                  autoPlay={live && playing}
                  preload={live ? "auto" : "metadata"}
                  className="absolute inset-0 w-full h-[112%] object-cover"
                >
                  {videoSources(c.video).map((src) => (
                    <source key={src} src={src} type="video/mp4" />
                  ))}
                </video>
              </div>
            );
          })}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#061A14]/90 via-[#061A14]/45 to-[#061A14]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061A14]/85 via-transparent to-[#061A14]/40" />

        {/* Chapter dots */}
        <ol className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3" aria-label="Chapters">
          {Array.from({ length: total }).map((_, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to chapter ${i + 1}`}
                aria-current={i === active}
                className={`block rounded-full transition-all cursor-pointer ${i === active ? "w-1.5 h-6 bg-amber-300" : "w-1.5 h-1.5 bg-white/50 hover:bg-white"}`}
              />
            </li>
          ))}
        </ol>

        {/* Copy */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-12 sm:px-20 lg:px-24 flex items-center">
          <AnimatePresence mode="wait">
            {!finale ? (
              <motion.div
                key={`ch-${active}`}
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-xl"
              >
                <div className="font-serif italic text-7xl sm:text-8xl text-white/25 leading-none">{num}.</div>
                {active === 0 ? (
                  <h1 className="font-serif text-5xl sm:text-7xl text-white leading-[0.95] -mt-3 uppercase tracking-tight">{copy.title}</h1>
                ) : (
                  <h2 className="font-serif text-5xl sm:text-7xl text-white leading-[0.95] -mt-3 uppercase tracking-tight">{copy.title}</h2>
                )}
                <p className="mt-5 text-sm sm:text-base text-emerald-50/85 leading-relaxed max-w-md">{copy.body}</p>
                <button
                  type="button"
                  onClick={() => onJump(ch.utility)}
                  className="mt-7 inline-flex items-center gap-2 border border-white/70 text-white text-[11px] tracking-[0.2em] font-semibold px-5 py-2.5 hover:bg-white hover:text-stone-950 transition cursor-pointer"
                >
                  {lang === "en" ? "READ MORE" : "SEE AM"} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="finale"
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full text-center"
              >
                <h2 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-white uppercase leading-[0.95]">
                  {lang === "en" ? <>Everyday life,<br />in one pocket</> : <>Your whole day,<br />for one pocket</>}
                </h2>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {CHIPS.map((c, i) => (
                    <motion.span
                      key={c}
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3 + (i % 3) * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
                      className="px-3 py-1.5 bg-stone-100/90 text-stone-900 text-[10px] tracking-[0.2em] font-semibold"
                    >
                      {c}
                    </motion.span>
                  ))}
                </div>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <Link href="/register" className="px-6 py-3 bg-amber-400 text-stone-950 text-xs font-bold tracking-widest hover:bg-amber-300 transition">
                    {lang === "en" ? "CREATE FREE ACCOUNT" : "OPEN ACCOUNT"}
                  </Link>
                  <button type="button" onClick={() => onJump("light")} className="px-6 py-3 border border-white/70 text-white text-xs font-bold tracking-widest hover:bg-white hover:text-stone-950 transition cursor-pointer">
                    {lang === "en" ? "TRY THE TOOLS" : "USE AM"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ChevronDown className="absolute bottom-5 left-1/2 -translate-x-1/2 w-5 h-5 text-white/70 animate-bounce z-10" aria-hidden />
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause background motion" : "Play background motion"}
          className="absolute bottom-5 right-5 z-20 w-10 h-10 rounded-full bg-white/15 backdrop-blur border border-white/40 text-white flex items-center justify-center hover:bg-white/30 cursor-pointer"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

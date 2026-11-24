"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, ChevronDown, Pause, Play } from "lucide-react";
import { pick, type Lang } from "@/lib/i18n";
import { SCENES } from "./StoryScenes";
import { videoSources } from "@/lib/videoSources";

interface Copy { title: string; body: string }
interface Chapter {
  video: string;
  /** Same clip, compressed to 720p and served from our own site: starts fast and plays smoothly on phones. */
  local: string;
  poster: string;
  utility: string;
  scene: string;
  en: Copy;
  pcm: Copy;
  yo: Copy;
  ha: Copy;
  ig: Copy;
}

const CHAPTERS: Chapter[] = [
  {
    video: "https://videos.pexels.com/video-files/29103994/12573651_3840_2160_30fps.mp4",
    local: "/videos/ch1.mp4",
    poster: "/images/story-dawn-commute.jpg",
    utility: "light",
    scene: "05:59 · LAGOS DAWN",
    en: { title: "Know before you go", body: "Live light status, flood alerts and fares for Lagos, Abuja, Port Harcourt and Kano — before you step outside." },
    pcm: { title: "Sabi before you waka", body: "See if light dey, where flood dey and how much transport be — before you commot house." },
    yo: { title: "Mọ̀ kí o tó lọ", body: "Mọ̀ bóyá iná wà, ibi tí omíyalé wà àti owó ọkọ̀ kí o tó jáde nílé." },
    ha: { title: "Ka sani kafin ka tafi", body: "Duba ko akwai wuta, inda ambaliya take da kuɗin mota kafin ka fita daga gida." },
    ig: { title: "Mara tupu ị pụọ", body: "Lelee ma ọkụ nọ, ebe idee mmiri dị na ọnụ ahịa ụgbọ ala tupu ị pụọ n'ụlọ." },
  },
  {
    video: "https://videos.pexels.com/video-files/27165160/12087844_3840_2160_25fps.mp4",
    local: "/videos/ch2.mp4",
    poster: "/images/story-market-fuel.jpg",
    utility: "price",
    scene: "09:00 · THE MARKET",
    en: { title: "Prices, made fair", body: "Crowd-sourced petrol, gas and market prices, plus the real cost of running your generator against the grid." },
    pcm: { title: "Price wey make sense", body: "Fuel, gas and market price from people for ground, plus how much your generator dey chop." },
    yo: { title: "Owó ọjà tó tọ́", body: "Owó epo, gáàsì àti ọjà láti ọ̀dọ̀ àwọn ènìyàn, àti iye tí jẹ́nẹ́rétọ̀ rẹ ń jẹ." },
    ha: { title: "Farashi mai adalci", body: "Farashin mai, gas da kasuwa daga mutane, da kuma nawa janareta ɗinka ke ci." },
    ig: { title: "Ọnụ ahịa kwesịrị ekwesị", body: "Ọnụ ahịa mmanụ, gas na ahịa sitere n'aka ndị mmadụ, na ego jenarétọ gị na-eri." },
  },
  {
    video: "https://videos.pexels.com/video-files/27706410/12209725_3840_2160_25fps.mp4",
    local: "/videos/ch3.mp4",
    poster: "/images/story-verify-shield.jpg",
    utility: "scam",
    scene: "12:30 · THE UNKNOWN NUMBER",
    en: { title: "Scam-proof by design", body: "Check NAFDAC numbers, score suspicious messages and keep a blocklist — all without leaving the app." },
    pcm: { title: "No let them 419 you", body: "Check NAFDAC number, score strange message and block fraud people — for one place." },
    yo: { title: "Kí ẹnikẹ́ni má rẹ́ ọ jẹ", body: "Ṣàyẹ̀wò nọ́ńbà NAFDAC, ṣírò ìfiranṣẹ́ tó ń dáni lójú àti dí àwọn ẹlẹ́tàn." },
    ha: { title: "Kare kanka daga zamba", body: "Duba lambar NAFDAC, auna saƙonnin da ake zargi, ka toshe masu zamba." },
    ig: { title: "Echegbula aghụghọ", body: "Lelee nọmba NAFDAC, tụọ ozi a na-enyo enyo, gbochie ndị aghụghọ." },
  },
  {
    video: "https://videos.pexels.com/video-files/853772/853772-hd_1920_1080_25fps.mp4",
    local: "/videos/ch4.mp4",
    poster: "/images/story-up-nepa.jpg",
    utility: "tax",
    scene: "16:00 · PAYDAY MATHS",
    en: { title: "Naira, tax and bills", body: "Convert at the street or official rate, work out PAYE and VAT, split the bill and never miss a due date." },
    pcm: { title: "Naira, tax and bill", body: "Change dollar at street or bank rate, calculate PAYE and VAT, share bill and remember due date." },
    yo: { title: "Náírà, owó-orí àti owó-ìsanwó", body: "Yí owó padà ní owó ìjọba tàbí ti òpópónà, ṣírò PAYE àti VAT, pín owó, má sì gbàgbé ọjọ́ ìsanwó." },
    ha: { title: "Naira, haraji da kuɗin biya", body: "Canza kuɗi a farashin gwamnati ko na kasuwa, lissafa PAYE da VAT, raba kuɗi, kada ka manta ranar biya." },
    ig: { title: "Naịra, ụtụ isi na ụgwọ", body: "Gbanwee ego n'ọnụ ahịa gọọmentị ma ọ bụ nke ahịa, gbakọọ PAYE na VAT, kee ụgwọ, echefula ụbọchị ịkwụ ụgwọ." },
  },
  {
    video: "https://videos.pexels.com/video-files/28925673/12518915_3840_2160_30fps.mp4",
    local: "/videos/ch5.mp4",
    poster: "/images/story-ajo-esusu.jpg",
    utility: "ajo",
    scene: "19:00 · THE CIRCLE MEETS",
    en: { title: "Ajo, tracked honestly", body: "Run your esusu circle with a central pool, clear rounds, payouts and records everybody can trust." },
    pcm: { title: "Ajo wey clear", body: "Run your esusu with one pool account, correct round, payout and record wey everybody go trust." },
    yo: { title: "Àjọ tí a tọpa pẹ̀lú òtítọ́", body: "Ṣe Àjọ rẹ pẹ̀lú àkọsílẹ̀ tó ṣe kedere tí gbogbo ènìyàn lè gbẹ́kẹ̀lé." },
    ha: { title: "Ajo mai gaskiya", body: "Gudanar da Ajo naka da zagaye, biya da bayanai a bayyane da kowa zai amince da su." },
    ig: { title: "Ajo e debere n'eziokwu", body: "Na-eme Ajo gị site na gburugburu, ịkwụ ụgwọ na ndekọ doro anya nke onye ọ bụla ga-atụkwasị obi." },
  },
];

const FINALE: Record<Lang, string[]> = {
  en: ["Everyday life,", "in one pocket"],
  pcm: ["Your whole day,", "for one pocket"],
  yo: ["Ìgbésí ayé ojoojúmọ́,", "nínú àpò kan"],
  ha: ["Rayuwar yau da kullum,", "a aljihu ɗaya"],
  ig: ["Ndụ kwa ụbọchị,", "n'akpa otu"],
};

const CHIPS = ["LIGHT", "FUEL", "NAIRA", "AJO", "SCAM-SAFE", "OFFLINE"];

export function MotionStage({ lang, onJump }: { lang: Lang; onJump: (utility: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [small, setSmall] = useState(false);
  const [ready, setReady] = useState<boolean[]>(() => CHAPTERS.map(() => false));
  const total = CHAPTERS.length + 1; // + finale
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(total - 1, Math.max(0, Math.floor(v * total))));
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
    // Weaker phones and Data Saver get the 720p renditions of the same clips.
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if ((nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4 || nav.connection?.saveData) setSmall(true);
  }, []);

  // Only the chapter on screen decodes video; the others stay loaded but paused, so scrolling stays smooth.
  const cur = Math.min(active, CHAPTERS.length - 1);
  useEffect(() => {
    const apply = () => {
      videos.current.forEach((v, i) => {
        if (!v) return;
        if (playing && i === cur && !document.hidden) v.play().catch(() => {});
        else v.pause();
      });
    };
    apply();
    document.addEventListener("visibilitychange", apply);
    return () => document.removeEventListener("visibilitychange", apply);
  }, [cur, playing]);

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + (span * (i + 0.5)) / total, behavior: "smooth" });
  };

  const finale = active === CHAPTERS.length;
  const ch = CHAPTERS[Math.min(active, CHAPTERS.length - 1)];
  const copy = ch[lang];
  const num = String(active + 1).padStart(2, "0");

  return (
    <div ref={ref} className="relative" style={{ height: `${total * 85}vh` }} id="motion">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden bg-[#061A14]">
        {/* Visual layer: every chapter keeps its own real video; only the active one plays */}
        <div aria-hidden className="absolute inset-0">
          {CHAPTERS.map((c, i) => {
            const near = Math.abs(i - cur) <= 1;
            const Scene = SCENES[i];
            return (
              <div key={c.video} className="absolute inset-0 transition-opacity duration-700 ease-out" style={{ opacity: i === cur ? 1 : 0 }}>
                {/* The illustrated scene is always there; the real video fades in over it once it can play */}
                <Scene />
                <video
                  ref={(el) => {
                    videos.current[i] = el;
                  }}
                  muted
                  loop
                  playsInline
                  disablePictureInPicture
                  autoPlay={i === cur && playing}
                  preload={near ? "auto" : "none"}
                  onCanPlay={() => setReady((r) => (r[i] ? r : r.map((v, k) => (k === i ? true : v))))}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                  style={{ opacity: ready[i] ? 1 : 0 }}
                >
                  {(small ? [c.local, ...videoSources(c.video, { small })] : [...videoSources(c.video, { small }), c.local]).map((src) => (
                    <source key={src} src={src} type="video/mp4" />
                  ))}
                </video>
              </div>
            );
          })}
        </div>
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
                <div className="font-mono text-[11px] tracking-[0.25em] text-amber-300 mb-1">{ch.scene}</div>
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
                  {pick(lang, "READ MORE", "SEE AM", "KÀ SÍI", "KARANTA", "GỤKWUO")} <ArrowRight className="w-3.5 h-3.5" />
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
                  {FINALE[lang][0]}<br />{FINALE[lang][1]}
                </h2>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {CHIPS.map((c, i) => (
                    <span
                      key={c}
                      style={{ animationDuration: `${3 + (i % 3) * 0.6}s`, animationDelay: `${i * 0.25}s` }}
                      className="nh-float px-3 py-1.5 bg-stone-100/90 text-stone-900 text-[10px] tracking-[0.2em] font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <Link href="/register" className="px-6 py-3 bg-amber-400 text-stone-950 text-xs font-bold tracking-widest hover:bg-amber-300 transition">
                    {pick(lang, "CREATE FREE ACCOUNT", "OPEN ACCOUNT", "ṢÍ ÀKÀÚNTÌ ỌFẸ́", "BUɗE ASUSU KYAUTA", "MEPEE AKAỤNTỤ N'EFU")}
                  </Link>
                  <button type="button" onClick={() => onJump("light")} className="px-6 py-3 border border-white/70 text-white text-xs font-bold tracking-widest hover:bg-white hover:text-stone-950 transition cursor-pointer">
                    {pick(lang, "TRY THE TOOLS", "USE AM", "LO ÀWỌN IRINṢẸ́", "YI AMFANI DA KAYAN AIKI", "JIDE NGWA")}
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
          className="absolute bottom-5 right-5 z-20 w-10 h-10 rounded-full bg-black/40 border border-white/40 text-white flex items-center justify-center hover:bg-white/30 cursor-pointer"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

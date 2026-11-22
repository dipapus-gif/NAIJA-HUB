"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Fuel, Plug, ShieldCheck, Users } from "lucide-react";

const CHAPTERS = [
  { n: "1.", title: "A taste of\nlight", body: "Know when NEPA is up, what each token really costs per kWh, and whether your generator is eating your money.", cta: "Open Light Tracker", href: "#utilities", Icon: Plug, chips: ["Band A–E", "Token ₦/kWh", "Live reports"], hue: "#fbbf24" },
  { n: "2.", title: "Made for the\nmarket run", body: "Crowd-sourced fuel and staples prices, trip fuel maths and naira rates — street or official — in one pocket.", cta: "Check prices", href: "#utilities", Icon: Fuel, chips: ["Petrol ₦", "Garri paint", "USD rate"], hue: "#f97316" },
  { n: "3.", title: "Verified.\nNo wahala.", body: "Scan a NAFDAC number, score a suspicious message and keep USSD and emergency codes ready without data.", cta: "Run a scam check", href: "#utilities", Icon: ShieldCheck, chips: ["NAFDAC", "*737#", "112"], hue: "#34d399" },
  { n: "4.", title: "Ajo, bills &\nsplit-the-bill", body: "Track your thrift rounds, never miss a due date and split the buka bill fairly — all stored on your phone.", cta: "Start tracking", href: "#utilities", Icon: Users, chips: ["Ajo rounds", "Reminders", "Fair split"], hue: "#a78bfa" },
];

export function MotionChapters() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-25, 25]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.08, 0.9]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cur = CHAPTERS[active];

  return (
    <section id="chapters" ref={wrap} className="mc-section relative border-b border-emerald-900/70">
      {/* side dot navigation */}
      <nav aria-label="Chapters" className={`hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-3 transition-opacity ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {CHAPTERS.map((c, i) => (
          <button
            key={c.n}
            aria-label={`Chapter ${i + 1}`}
            onClick={() => refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className={`rounded-full transition-all cursor-pointer ${i === active ? "w-2.5 h-6 bg-amber-300" : "w-2.5 h-2.5 bg-emerald-200/40 hover:bg-emerald-200/80"}`}
          />
        ))}
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-8">
        {/* chapter copy */}
        <div>
          {CHAPTERS.map((c, i) => (
            <article
              key={c.n}
              data-i={i}
              ref={(el) => { refs.current[i] = el; }}
              className="min-h-[85vh] flex flex-col justify-center md:pl-10"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-20% 0px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="mc-serif text-6xl sm:text-7xl text-amber-300/80 leading-none">{c.n}</div>
                <h2 className="mc-serif mc-heading text-4xl sm:text-6xl leading-[1.05] whitespace-pre-line mt-2">{c.title}</h2>
                <p className="mc-body mt-5 max-w-md text-sm sm:text-base leading-relaxed">{c.body}</p>
                <a href={c.href} className="mc-cta inline-block mt-7 px-6 py-2.5 border text-xs font-bold tracking-[0.18em] uppercase hover:bg-amber-300 hover:text-stone-950 hover:border-amber-300 transition">
                  {c.cta}
                </a>
              </motion.div>
              {/* mobile visual */}
              <div className="md:hidden mt-8 flex justify-center"><c.Icon className="w-24 h-24" style={{ color: c.hue }} /></div>
            </article>
          ))}
        </div>

        {/* sticky motion stage */}
        <div className="hidden md:block">
          <div className="sticky top-0 h-screen flex items-center justify-center">
            <div className="relative w-[420px] h-[520px]">
              <motion.div style={{ rotate, scale }} className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 400 400" className="w-full h-full" aria-hidden>
                  <defs>
                    <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={cur.hue} />
                      <stop offset="100%" stopColor="#065f46" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2].map((k) => (
                    <motion.path
                      key={k}
                      d={`M60 ${120 + k * 40} C 140 ${20 + k * 30}, 260 ${300 - k * 20}, 340 ${180 + k * 20}`}
                      fill="none"
                      stroke="url(#ribbon)"
                      strokeWidth={14 - k * 3}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.6, delay: k * 0.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    />
                  ))}
                  <circle cx="200" cy="200" r="150" fill="none" stroke={cur.hue} strokeOpacity="0.25" strokeWidth="2" strokeDasharray="4 10" />
                </svg>
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-44 h-44 rounded-full flex items-center justify-center border" style={{ background: `${cur.hue}22`, borderColor: `${cur.hue}88`, boxShadow: `0 0 90px ${cur.hue}55` }}>
                    <cur.Icon className="w-20 h-20" style={{ color: cur.hue }} />
                  </div>
                </motion.div>
              </AnimatePresence>
              {cur.chips.map((chip, i) => (
                <motion.span
                  key={`${active}-${chip}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, -8, 0] }}
                  transition={{ opacity: { delay: 0.2 + i * 0.1 }, y: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" } }}
                  className="mc-chip absolute text-[10px] font-semibold tracking-[0.2em] uppercase px-3 py-1.5 border backdrop-blur"
                  style={[{ top: "6%", right: "2%" }, { top: "48%", left: "-6%" }, { bottom: "10%", right: "8%" }][i]}
                >
                  {chip}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

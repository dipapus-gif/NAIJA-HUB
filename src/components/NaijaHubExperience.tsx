"use client";

import { LazyVideo } from "./site/LazyVideo";

import React, { useCallback, useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";
import {
  ArrowDown,
  CheckCircle2,
  Download,
  Globe,
  HardDrive,
  Play,
  SignalLow,
  Smartphone,
  Terminal,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { COPY, pick } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";
import { LangBar } from "./site/LangBar";
import { SideMenu } from "./site/SideMenu";
import {
  DEFAULT_DEVICE_STATE,
  getDeviceStorageBytes,
  loadDeviceState,
  saveDeviceState,
  type NaijaHubDeviceState,
} from "@/lib/localStore";
import {
  StoryChapters,
  type CrowdPriceItem,
  type NafdacProductItem,
  type NepaReportItem,
  type TransitRouteItem,
} from "./StoryChapters";
import type { UtilityKey } from "./UtilitiesWorkbench";
const UtilitiesWorkbench = dynamic(() => import("./UtilitiesWorkbench").then((m) => m.UtilitiesWorkbench), { ssr: false, loading: () => <div className="min-h-[60vh]" aria-hidden /> });
const CalcTestModal = dynamic(() => import("./CalcTestModal").then((m) => m.CalcTestModal), { ssr: false });
import Link from "next/link";
import { ThemeToggle } from "./site/ThemeToggle";
import { AccountMenu } from "./site/AccountMenu";
import dynamic from "next/dynamic";
const Copilot = dynamic(() => import("./site/Copilot").then((m) => m.Copilot), { ssr: false });
import { MotionStage } from "./site/MotionStage";
import { StoryDay } from "./site/StoryDay";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const COMMUNITY_CACHE_KEY = "naija_hub_community_cache_v1";

const FALLBACK_COMMUNITY = {
  nepa: [
    {
      id: 1,
      city: "Lagos",
      area: "Surulere",
      street: "Adelabu Street",
      disco: "EKEDC",
      band: "Band A",
      status: "ON",
      note: "Up NEPA! Steady 225V.",
      reportedAt: new Date().toISOString(),
    },
  ] as NepaReportItem[],
  prices: [
    {
      id: 1,
      category: "FUEL",
      itemName: "PMS Petrol",
      unit: "per Litre",
      location: "NNPC retail, reported 15 Nov 2026",
      city: "Lagos",
      priceNgn: 1289,
      previousPriceNgn: 1350,
      reportedAt: new Date().toISOString(),
    },
  ] as CrowdPriceItem[],
  transit: [
    {
      id: 1,
      city: "Lagos",
      mode: "Danfo",
      fromStop: "Oshodi",
      toStop: "CMS / Marina",
      fareMinNgn: 800,
      fareMaxNgn: 1200,
      alertLevel: "TRAFFIC",
      alertNote: "Slow inward ramp movement",
      updatedAt: new Date().toISOString(),
    },
  ] as TransitRouteItem[],
  nafdac: [
    {
      id: 1,
      regNumber: "A4-1234",
      productName: "Lonart DS (Artemether 80mg / Lumefantrine 480mg)",
      manufacturer: "Greenlife Pharmaceuticals Ltd",
      category: "Antimalarial Medicine",
      status: "VERIFIED",
      guidance: "Registered & genuine NAFDAC Greenbook entry.",
    },
  ] as NafdacProductItem[],
  referenceRates: {
    USD: 1363,
    GBP: 1795,
    EUR: 1495,
  },
};

export function NaijaHubExperience() {
  const [lang] = useLang();
  const [networkMode, setNetworkMode] = useState<
    "ONLINE" | "WEAK_3G" | "OFFLINE"
  >("ONLINE");
  const [activeUtility, setActiveUtility] = useState<UtilityKey>("light");
  const [deviceState, setDeviceState] =
    useState<NaijaHubDeviceState>(DEFAULT_DEVICE_STATE);
  const [storageBytes, setStorageBytes] = useState<number>(2800);
  const [swActive, setSwActive] = useState<boolean>(false);
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [nepaList, setNepaList] = useState<NepaReportItem[]>(
    FALLBACK_COMMUNITY.nepa
  );
  const [priceList, setPriceList] = useState<CrowdPriceItem[]>(
    FALLBACK_COMMUNITY.prices
  );
  const [transitList, setTransitList] = useState<TransitRouteItem[]>(
    FALLBACK_COMMUNITY.transit
  );
  const [nafdacList, setNafdacList] = useState<NafdacProductItem[]>(
    FALLBACK_COMMUNITY.nafdac
  );
  const [referenceRates, setReferenceRates] = useState(
    FALLBACK_COMMUNITY.referenceRates
  );

  const { scrollYProgress } = useScroll();
  const scaleX = scrollYProgress; // direct, no spring: one fewer animation loop while scrolling

  // Hydrate offline device state + register Service Worker + PWA prompt listener
  useEffect(() => {
    const loaded = loadDeviceState();
    setDeviceState(loaded);
    setStorageBytes(getDeviceStorageBytes());

    try {
      const cachedCommunity = window.localStorage.getItem(COMMUNITY_CACHE_KEY);
      if (cachedCommunity) {
        const parsed = JSON.parse(cachedCommunity);
        if (parsed.nepa?.length) setNepaList(parsed.nepa);
        if (parsed.prices?.length) setPriceList(parsed.prices);
        if (parsed.transit?.length) setTransitList(parsed.transit);
        if (parsed.nafdac?.length) setNafdacList(parsed.nafdac);
        if (parsed.referenceRates) setReferenceRates(parsed.referenceRates);
      }
    } catch {
      // Ignore corrupt cache
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => setSwActive(true))
        .catch(() => setSwActive(false));
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const fetchCommunityData = useCallback(async () => {
    if (networkMode === "OFFLINE") return;
    try {
      const res = await fetch("/api/community", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok) {
        setNepaList(data.nepa);
        setPriceList(data.prices);
        setTransitList(data.transit);
        setNafdacList(data.nafdac);
        if (data.referenceRates) {
          setReferenceRates({
            USD: data.referenceRates.USD,
            GBP: data.referenceRates.GBP,
            EUR: data.referenceRates.EUR,
          });
        }
        try {
          window.localStorage.setItem(
            COMMUNITY_CACHE_KEY,
            JSON.stringify(data)
          );
        } catch {
          // Safe fallback
        }
      }
    } catch {
      // Offline-first fallback already hydrated
    }
  }, [networkMode]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const handleUpdateDeviceState = useCallback(
    (updater: (prev: NaijaHubDeviceState) => NaijaHubDeviceState) => {
      setDeviceState((prev) => {
        const next = updater(prev);
        saveDeviceState(next);
        setTimeout(() => setStorageBytes(getDeviceStorageBytes()), 0);
        return next;
      });
    },
    []
  );

  const handleResetDeviceState = useCallback(() => {
    saveDeviceState(DEFAULT_DEVICE_STATE);
    setDeviceState(DEFAULT_DEVICE_STATE);
    setStorageBytes(getDeviceStorageBytes());
  }, []);

  const handleSubmitCommunityReport = useCallback(
    async (payload: Record<string, unknown>) => {
      // If user toggled Offline Simulator, save optimistically to local snapshot!
      if (networkMode === "OFFLINE") {
        if (payload.type === "NEPA_REPORT") {
          setNepaList((prev) => [
            {
              id: Date.now(),
              city: String(payload.city || "Lagos"),
              area: String(payload.area || ""),
              street: String(payload.street || ""),
              disco: String(payload.disco || "IKEDC"),
              band: "Band B",
              status: String(payload.status || "ON"),
              note: `${String(payload.note || "")} (Queued Offline)`,
              reportedAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        } else if (payload.type === "PRICE_REPORT") {
          setPriceList((prev) => [
            {
              id: Date.now(),
              category: String(payload.category || "FUEL"),
              itemName: String(payload.itemName || ""),
              unit: String(payload.unit || ""),
              location: `${String(payload.location || "")} (Offline Local)`,
              city: String(payload.city || "Lagos"),
              priceNgn: Number(payload.priceNgn) || 1000,
              previousPriceNgn: Number(payload.previousPriceNgn) || 1000,
              reportedAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        } else if (payload.type === "TRANSIT_REPORT") {
          setTransitList((prev) => [
            {
              id: Date.now(),
              city: String(payload.city || "Lagos"),
              mode: String(payload.mode || "Danfo"),
              fromStop: String(payload.fromStop || ""),
              toStop: String(payload.toStop || ""),
              fareMinNgn: Number(payload.fareMinNgn) || 400,
              fareMaxNgn: Number(payload.fareMaxNgn) || 700,
              alertLevel: String(payload.alertLevel || "CLEAR"),
              alertNote: `${String(payload.alertNote || "")} (Offline Local)`,
              updatedAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
        return true;
      }

      try {
        const res = await fetch("/api/community", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return false;
        await fetchCommunityData();
        return true;
      } catch {
        return false;
      }
    },
    [networkMode, fetchCommunityData]
  );

  useEffect(() => {
    const u = new URLSearchParams(window.location.search).get("u");
    if (!u) return;
    setActiveUtility(u as UtilityKey);
    let tries = 0;
    const id = window.setInterval(() => {
      const el = document.getElementById("utilities");
      if (el || ++tries > 20) {
        window.clearInterval(id);
        el?.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
    return () => window.clearInterval(id);
  }, []);

  const handleJumpToUtility = (key: string) => {
    setActiveUtility(key as UtilityKey);
    const el = document.getElementById("utilities");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      setInstallPrompt(null);
      return;
    }
    setTestModalOpen(true);
  };

  const cycleNetworkMode = () => {
    setNetworkMode((prev) =>
      prev === "ONLINE"
        ? "WEAK_3G"
        : prev === "WEAK_3G"
        ? "OFFLINE"
        : "ONLINE"
    );
  };

  const t = COPY[lang];

  return (
    <div className="min-h-screen flex flex-col bg-[#061A14] text-stone-100">
      <SideMenu onJumpUtility={handleJumpToUtility} />
      {/* Kinetic Scroll Progress Line */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-amber-400 origin-left z-50"
      />

      {/* Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#061A14]/95 border-b border-emerald-900/80">
        <LangBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <a href="#top" className="flex items-center gap-2.5 group">
            <img
              src="/images/naija-hub-icon.png"
              alt="Naija Hub Emblem"
              className="w-9 h-9 rounded-xl border border-emerald-700/60 shadow-sm"
            />
            <div>
              <div className="font-display font-bold text-base sm:text-lg text-white leading-none">
                Naija Hub
              </div>
              <div className="font-mono text-[10px] text-amber-300 tracking-wider">
                OFFLINE SUPER-APP
              </div>
            </div>
          </a>

          {/* Center Nav Anchors */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-emerald-100/90">
            <a href="#story" className="hover:text-amber-300 transition">
              {pick(lang, "Visual Story (5 Reels)", "Street Video Torí", "Ìtàn àwòrán", "Labarin hotuna", "Akụkọ onyonyo")}
            </a>
            <Link href="/tools" className="hover:text-amber-300 transition">
              {pick(lang, "Toolkit", "Toolkit", "Àpótí irinṣẹ́", "Akwatin kayan aiki", "Igbe ngwa")}
            </Link>
            <Link href="/ajo" className="hover:text-amber-300 transition">
              {pick(lang, "Ajo circles", "Ajo circles", "Àjọ", "Ajo", "Ajo")}
            </Link>
            <Link href="/health" className="hover:text-amber-300 transition">
              {pick(lang, "Health & Emergency", "Hospital & Emergency", "Ìlera àti pàjáwìrì", "Lafiya da gaggawa", "Ahụike na ihe mberede")}
            </Link>
            <a href="#utilities" className="hover:text-amber-300 transition">
              {pick(lang, "10 Offline Utilities", "All 10 Tools", "Irinṣẹ́ mẹ́wàá", "Kayan aiki 10", "Ngwa iri")}
            </a>
            <button
              type="button"
              onClick={() => setTestModalOpen(true)}
              className="inline-flex items-center gap-1.5 hover:text-amber-300 transition cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang !== "pcm" ? "Calc Tests (18/18)" : "Maths Test"}</span>
            </button>
          </nav>

          {/* Right Controls: Network Mode + EN/Pidgin + Install */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleNetworkMode}
              title="Click to simulate Weak 3G or Offline mode"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-mono text-[11px] font-semibold border transition cursor-pointer ${
                networkMode === "OFFLINE"
                  ? "bg-amber-400/20 text-amber-300 border-amber-400/50"
                  : networkMode === "WEAK_3G"
                  ? "bg-emerald-900 text-amber-200 border-emerald-700"
                  : "bg-emerald-950 text-emerald-300 border-emerald-800"
              }`}
            >
              {networkMode === "OFFLINE" ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Offline Mode</span>
                </>
              ) : networkMode === "WEAK_3G" ? (
                <>
                  <SignalLow className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Weak 3G</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Online</span>
                </>
              )}
            </button>



            <button
              type="button"
              onClick={handleInstallClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-stone-950 hover:bg-amber-300 text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </header>

      <MotionStage lang={lang} onJump={handleJumpToUtility} />

      <section aria-label="Health and emergency" className="bg-emerald-950 border-y border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <h2 className="font-display font-bold text-xl text-white">
              {lang !== "pcm" ? "Health & Emergency, in all 36 states + FCT" : "Hospital & Emergency for all 36 states + FCT"}
            </h2>
            <p className="text-sm text-emerald-100/80 mt-1">
              {lang !== "pcm"
                ? "Road-accident steps, pregnancy danger signs, hospitals near you, and appointment, antenatal and bed requests."
                : "Accident steps, belle-woman warning signs, hospital near you, plus appointment, antenatal and bed request."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="tel:112" className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold">Call 112</a>
            <Link href="/health" className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold">{lang !== "pcm" ? "Open Health hub" : "Open Health"}</Link>
          </div>
        </div>
      </section>

      {/* Toolkit strip + story */}
      <section className="border-b border-emerald-900/70 bg-[#082018]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h2 className="font-display font-bold text-xl text-white">{pick(lang, "New: the Toolkit, 17 tools for everyday life and tech work", "New: Toolkit, 17 tools for hustle and tech work", "Tuntun: Àpótí irinṣẹ́, irinṣẹ́ 17", "Sabo: Akwatin kayan aiki, kayan aiki 17", "Ọhụrụ: Igbe ngwa, ngwa 17")}</h2>
            <p className="text-sm text-emerald-100/80 mt-1">Data budget, debts, shop ledger, school fees, units, health basics, documents, holidays, invoices, power planner, developer tools and more.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools" className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold">Open Toolkit</Link>
            <Link href="/ajo" className="px-4 py-2 rounded-full border border-emerald-600 text-emerald-100 hover:border-amber-400 text-xs font-bold">Ajo circles</Link>
          </div>
        </div>
      </section>
      <StoryDay lang={lang} />

      {/* ============================================================= */}
      {/* HERO STAGE: FULL-BLEED LAGOS MOTION VIDEO + LIVE POCKET HUB   */}
      {/* ============================================================= */}
      <section
        id="top"
        className="relative min-h-[88vh] flex items-center overflow-hidden border-b border-emerald-900/70"
      >
        {/* Background Lagos Aerial Video */}
        <LazyVideo
          src="https://videos.pexels.com/video-files/29103994/12573651_3840_2160_30fps.mp4"
          poster="/images/story-dawn-commute.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        {/* High-contrast dark emerald editorial scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061A14]/95 via-[#061A14]/86 to-[#061A14]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061A14] via-transparent to-[#061A14]/50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Editorial Copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-700/70 text-amber-300 font-mono text-xs">
                <Globe className="w-3.5 h-3.5" />
                <span>{t.badgeTime}</span>
              </div>

              <h2 className="font-display text-4xl sm:text-6xl lg:text-[4.1rem] font-bold text-white tracking-tight leading-[1.05]">
                {t.heroTitle}
              </h2>

              <p className="text-base sm:text-lg text-emerald-50/90 max-w-2xl leading-relaxed">
                {t.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#utilities"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 text-stone-950 font-display font-bold text-sm sm:text-base hover:bg-amber-300 shadow-lg shadow-amber-400/15 transition"
                >
                  <Smartphone className="w-4 h-4" />
                  {t.ctaOpenApp}
                </a>

                <a
                  href="#story"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-950/90 hover:bg-emerald-900 text-white border border-emerald-700/80 font-semibold text-sm sm:text-base transition"
                >
                  <Play className="w-4 h-4 text-amber-300 fill-current" />
                  {t.ctaWatchStory}
                </a>

                <button
                  type="button"
                  onClick={() => setTestModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-stone-950/75 hover:bg-stone-900 text-emerald-200 border border-emerald-800/70 font-mono text-xs font-semibold transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  18/18 Calc Tests Passing
                </button>
              </div>

              {/* Offline Guarantee Micro-Metrics */}
              <div className="pt-4 grid grid-cols-3 gap-4 max-w-xl border-t border-emerald-800/60 text-xs">
                <div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-amber-300">
                    10-in-1
                  </div>
                  <div className="text-emerald-200/80">
                    {lang !== "pcm"
                      ? "Replaces 6 heavy apps"
                      : "Replace 6 heavy apps"}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-white">
                    0 KB Cloud
                  </div>
                  <div className="text-emerald-200/80">
                    {lang !== "pcm"
                      ? "Personal data stays on phone"
                      : "All data dey your phone"}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-emerald-300">
                    EN + PCM
                  </div>
                  <div className="text-emerald-200/80">
                    {lang !== "pcm"
                      ? "English & Nigerian Pidgin"
                      : "English & Naija Pidgin"}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Interactive Live Phone Snapshot Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="max-w-md mx-auto rounded-[2.4rem] p-3 bg-stone-950/95 border-4 border-emerald-900/90 shadow-2xl backdrop-blur-md">
                <div className="rounded-[1.9rem] bg-[#09291E] p-5 border border-emerald-800/60 space-y-4">
                  {/* Status Bar */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-300">
                    <span>06:00 • LIET BUILD</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-amber-300">
                      PWA READY
                    </span>
                  </div>

                  {/* Live NEPA Banner inside Phone */}
                  <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-mono text-emerald-300">
                        {lang !== "pcm" ? "YOUR NEPA STATUS" : "YOUR HOUSE LIGHT"}
                      </div>
                      <div className="font-display font-bold text-lg text-white flex items-center gap-1.5 mt-0.5">
                        <Zap className="w-4 h-4 text-amber-400 fill-current" />
                        {deviceState.nepaIsOn
                          ? lang !== "pcm"
                            ? "UP NEPA! (Grid ON)"
                            : "LIGHT DEY! (ON)"
                          : lang !== "pcm"
                          ? "Outage (On Gen/Inv)"
                          : "NO LIGHT (OFF)"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJumpToUtility("light")}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 font-mono text-xs font-bold hover:bg-amber-300 cursor-pointer"
                    >
                      Log
                    </button>
                  </div>

                  {/* Live Snapshot Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleJumpToUtility("rates")}
                      className="p-3.5 rounded-2xl bg-emerald-900/55 hover:bg-emerald-900 border border-emerald-800/80 text-left transition cursor-pointer"
                    >
                      <span className="font-mono text-[10px] text-emerald-300 block">
                        USD STREET RATE
                      </span>
                      <span className="font-mono text-lg font-bold text-white tabular-nums">
                        ₦{deviceState.streetRates.USD.toLocaleString()}
                      </span>
                      <span className="block text-[11px] text-amber-300 mt-0.5">
                        Ref: ₦{referenceRates.USD} →
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleJumpToUtility("price")}
                      className="p-3.5 rounded-2xl bg-emerald-900/55 hover:bg-emerald-900 border border-emerald-800/80 text-left transition cursor-pointer"
                    >
                      <span className="font-mono text-[10px] text-emerald-300 block">
                        PMS PETROL WATCH
                      </span>
                      <span className="font-mono text-lg font-bold text-white tabular-nums">
                        ₦{priceList[0]?.priceNgn ?? 1289}/L
                      </span>
                      <span className="block text-[11px] text-emerald-300 mt-0.5 truncate">
                        {priceList[0]?.city ?? "Lagos"} pump →
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleJumpToUtility("ajo")}
                      className="p-3.5 rounded-2xl bg-emerald-900/55 hover:bg-emerald-900 border border-emerald-800/80 text-left transition cursor-pointer"
                    >
                      <span className="font-mono text-[10px] text-emerald-300 block">
                        AJO NEXT COLLECTOR
                      </span>
                      <span className="font-semibold text-sm text-white truncate block mt-0.5">
                        {deviceState.ajoMembers[
                          deviceState.ajoCurrentRoundIndex %
                            deviceState.ajoMembers.length
                        ]?.name ?? "Hauwa Bello"}
                      </span>
                      <span className="block text-[11px] text-amber-300 font-mono mt-0.5">
                        Pot: ₦
                        {(
                          deviceState.ajoContributionNgn *
                          deviceState.ajoMembers.length
                        ).toLocaleString()}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleJumpToUtility("codes")}
                      className="p-3.5 rounded-2xl bg-emerald-900/55 hover:bg-emerald-900 border border-emerald-800/80 text-left transition cursor-pointer"
                    >
                      <span className="font-mono text-[10px] text-emerald-300 block">
                        NO-DATA LIFELINES
                      </span>
                      <span className="font-mono text-base font-bold text-amber-300 block mt-0.5">
                        *310# • 112
                      </span>
                      <span className="block text-[11px] text-emerald-200 mt-0.5">
                        Tap to dial →
                      </span>
                    </button>
                  </div>

                  {/* Quick Jump Chips */}
                  <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300 font-mono">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                      Saved on phone ({(storageBytes / 1024).toFixed(1)} KB)
                    </span>
                    <a
                      href="#story"
                      className="inline-flex items-center gap-1 text-amber-300 hover:underline"
                    >
                      Scroll Story <ArrowDown className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* ACT II: SCROLL-DRIVEN VIDEO & PHOTO STORYTELLING CHAPTERS     */}
      {/* ============================================================= */}
      <StoryChapters
        lang={lang}
        networkMode={networkMode}
        nepaList={nepaList}
        priceList={priceList}
        transitList={transitList}
        nafdacList={nafdacList}
        onSubmitCommunityReport={handleSubmitCommunityReport}
        onJumpToUtility={handleJumpToUtility}
      />

      {/* ============================================================= */}
      {/* ACT III: ALL 10 OFFLINE-FIRST UTILITIES WORKBENCH & PHONE SIM */}
      {/* ============================================================= */}
      <UtilitiesWorkbench
        lang={lang}
        activeUtility={activeUtility}
        onSelectUtility={setActiveUtility}
        deviceState={deviceState}
        onUpdateDeviceState={handleUpdateDeviceState}
        referenceRates={referenceRates}
        storageBytes={storageBytes}
        networkMode={networkMode}
        onOpenTestSuite={() => setTestModalOpen(true)}
      />

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 border-t border-stone-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <img
              src="/images/naija-hub-icon.png"
              alt="Naija Hub"
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <div className="font-display font-bold text-stone-100 text-sm">
                Naija Hub — Offline-First Utilities Super-App
              </div>
              <p className="text-stone-500 mt-0.5">
                Built for Android &amp; iPhone • English &amp; Nigerian Pidgin
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono">
            <button
              type="button"
              onClick={() => setTestModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Run 18/18 Calculation Tests
            </button>
            <span>•</span>
            <a href="https://github.com/dipapus-gif/NAIJA-HUB/releases/latest" target="_blank" rel="noopener noreferrer" className="hover:text-white">Desktop app</a>
            <span>•</span>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/data-inventory" className="hover:text-white">Data inventory</Link>
            <span>•</span>
            <button
              type="button"
              onClick={handleInstallClick}
              className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
            >
              Install Offline Web App
            </button>
          </div>
        </div>
      </footer>

      <Copilot />

      {/* Calculation Tests & Offline Device Diagnostics Modal */}
      <CalcTestModal
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        swActive={swActive}
        storageBytes={storageBytes}
        deviceState={deviceState}
        onResetDeviceState={handleResetDeviceState}
      />
    </div>
  );
}

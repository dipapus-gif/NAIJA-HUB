"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bus,
  CheckCircle2,
  CloudRain,
  Flame,
  Fuel,
  MapPin,
  Plus,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  WifiOff,
  Zap,
} from "lucide-react";
import type { Lang } from "@/lib/i18n";

export interface NepaReportItem {
  id: number;
  city: string;
  area: string;
  street: string;
  disco: string;
  band: string;
  status: "ON" | "OFF" | "LOW_VOLTAGE" | string;
  note: string;
  reportedAt: string;
}

export interface CrowdPriceItem {
  id: number;
  category: "FUEL" | "STAPLE" | string;
  itemName: string;
  unit: string;
  location: string;
  city: string;
  priceNgn: number;
  previousPriceNgn: number;
  reportedAt: string;
}

export interface TransitRouteItem {
  id: number;
  city: string;
  mode: string;
  fromStop: string;
  toStop: string;
  fareMinNgn: number;
  fareMaxNgn: number;
  alertLevel: "CLEAR" | "TRAFFIC" | "FLOOD" | string;
  alertNote: string;
  updatedAt: string;
}

export interface NafdacProductItem {
  id: number;
  regNumber: string;
  productName: string;
  manufacturer: string;
  category: string;
  status: string;
  guidance: string;
}

interface StoryChaptersProps {
  lang: Lang;
  networkMode: "ONLINE" | "WEAK_3G" | "OFFLINE";
  nepaList: NepaReportItem[];
  priceList: CrowdPriceItem[];
  transitList: TransitRouteItem[];
  nafdacList: NafdacProductItem[];
  onSubmitCommunityReport: (payload: Record<string, unknown>) => Promise<boolean>;
  onJumpToUtility: (utilityKey: string) => void;
}

function formatNaira(n: number) {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}

export function StoryChapters({
  lang,
  networkMode,
  nepaList,
  priceList,
  transitList,
  nafdacList,
  onSubmitCommunityReport,
  onJumpToUtility,
}: StoryChaptersProps) {
  const [selectedCity, setSelectedCity] = useState<string>("Lagos");
  const [priceFilter, setPriceFilter] = useState<"ALL" | "FUEL" | "STAPLE">("ALL");
  const [nafdacInput, setNafdacInput] = useState<string>("A4-1234");
  const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({
    ch1: true,
    ch2: true,
    ch4: true,
    ch5: true,
  });

  // Quick community report forms
  const [showNepaForm, setShowNepaForm] = useState(false);
  const [nepaCity, setNepaCity] = useState("Lagos");
  const [nepaArea, setNepaArea] = useState("");
  const [nepaStreet, setNepaStreet] = useState("");
  const [nepaDisco, setNepaDisco] = useState("IKEDC");
  const [nepaStatus, setNepaStatus] = useState("ON");
  const [nepaNote, setNepaNote] = useState("");
  const [submittingNepa, setSubmittingNepa] = useState(false);

  const [showPriceForm, setShowPriceForm] = useState(false);
  const [priceCat, setPriceCat] = useState<"FUEL" | "STAPLE">("FUEL");
  const [priceItem, setPriceItem] = useState("PMS Petrol");
  const [priceUnit, setPriceUnit] = useState("per Litre");
  const [priceLoc, setPriceLoc] = useState("");
  const [priceCity, setPriceCity] = useState("Lagos");
  const [priceVal, setPriceVal] = useState("1010");
  const [submittingPrice, setSubmittingPrice] = useState(false);

  const [showTransitForm, setShowTransitForm] = useState(false);
  const [trMode, setTrMode] = useState("Danfo");
  const [trFrom, setTrFrom] = useState("");
  const [trTo, setTrTo] = useState("");
  const [trMin, setTrMin] = useState("500");
  const [trMax, setTrMax] = useState("800");
  const [trAlert, setTrAlert] = useState("TRAFFIC");
  const [trNote, setTrNote] = useState("");
  const [submittingTransit, setSubmittingTransit] = useState(false);

  const filteredTransit = transitList.filter(
    (r) => r.city.toLowerCase() === selectedCity.toLowerCase()
  );

  const filteredPrices = priceList.filter((p) =>
    priceFilter === "ALL" ? true : p.category === priceFilter
  );

  const normalizedNafdac = nafdacInput.trim().toUpperCase();
  const matchedNafdac = nafdacList.find(
    (item) => item.regNumber.toUpperCase() === normalizedNafdac
  );

  const toggleMute = (key: string) => {
    setMutedVideos((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNepaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nepaArea.trim() || !nepaStreet.trim()) return;
    setSubmittingNepa(true);
    const ok = await onSubmitCommunityReport({
      type: "NEPA_REPORT",
      city: nepaCity,
      area: nepaArea,
      street: nepaStreet,
      disco: nepaDisco,
      band: "Band B",
      status: nepaStatus,
      note: nepaNote || (nepaStatus === "ON" ? "Up NEPA confirmed on street" : "Outage reported"),
    });
    setSubmittingNepa(false);
    if (ok) {
      setNepaArea("");
      setNepaStreet("");
      setNepaNote("");
      setShowNepaForm(false);
    }
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceLoc.trim()) return;
    setSubmittingPrice(true);
    const currentNum = Number(priceVal) || 1000;
    const prevMatch = priceList.find(
      (p) => p.itemName.toLowerCase() === priceItem.toLowerCase()
    );
    const ok = await onSubmitCommunityReport({
      type: "PRICE_REPORT",
      category: priceCat,
      itemName: priceItem,
      unit: priceUnit,
      location: priceLoc,
      city: priceCity,
      priceNgn: currentNum,
      previousPriceNgn: prevMatch ? prevMatch.priceNgn : currentNum,
    });
    setSubmittingPrice(false);
    if (ok) {
      setPriceLoc("");
      setShowPriceForm(false);
    }
  };

  const handleTransitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trFrom.trim() || !trTo.trim()) return;
    setSubmittingTransit(true);
    const ok = await onSubmitCommunityReport({
      type: "TRANSIT_REPORT",
      city: selectedCity,
      mode: trMode,
      fromStop: trFrom,
      toStop: trTo,
      fareMinNgn: Number(trMin) || 400,
      fareMaxNgn: Number(trMax) || 700,
      alertLevel: trAlert,
      alertNote: trNote || "Reported by commuter",
    });
    setSubmittingTransit(false);
    if (ok) {
      setTrFrom("");
      setTrTo("");
      setTrNote("");
      setShowTransitForm(false);
    }
  };

  return (
    <section id="story" className="relative py-20 md:py-28 bg-[#FAF8F4] text-stone-900 overflow-hidden">
      {/* Subtle vertical timeline thread */}
      <div className="pointer-events-none hidden lg:block absolute left-1/2 top-36 bottom-24 w-px bg-gradient-to-b from-emerald-800/10 via-emerald-700/30 to-amber-500/20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Intro + Timestamped Origin Chat */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16 md:mb-24"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 text-amber-300 font-mono text-xs tracking-wider uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {lang === "en"
              ? "Visual Documentary • 5 Chapters in Motion"
              : "Street Documentary • 5 Tori Inside Video & Picture"}
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-stone-950 mb-4">
            {lang === "en"
              ? "Why juggle six heavy apps when one offline hub works on 1-bar data?"
              : "Why you go carry six heavy app when one small offline hub fit run everything?"}
          </h2>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
            {lang === "en"
              ? "At 05:59 AM on 11/21/2026, LIET sketched the blueprint for a Nigerian utilities super-app. At 06:00 AM, the offline engine and calculation tests were ready. Walk through a single Nigerian day below — every video, photograph, and live crowd widget tells the story."
              : "By 05:59 AM on 11/21/2026, LIET drop the idea for Naija super-app. By 06:00 AM, the code and calculation test don set. Follow one full day for Naija below — video, picture, and live street update dey inside."}
          </p>
        </motion.div>

        {/* The Two-Minute LIET Dispatch Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="rounded-2xl bg-white border border-stone-200/90 p-6 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-200">
                [05:59, 11/21/2026] LIET
              </span>
              <span className="text-xs font-mono text-stone-500">THE PROBLEM & VISION</span>
            </div>
            <p className="text-stone-800 font-medium mb-3">
              &ldquo;Naija Hub: a utilities super-app, built offline-first. Most Nigerians juggle five or six apps for everyday basics. One lightweight app that works on weak data could replace them.&rdquo;
            </p>
            <ul className="space-y-1.5 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span><strong>Bills &amp; airtime:</strong> prepaid meter tokens, cable TV, water &amp; saved beneficiaries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span><strong>NEPA tracker:</strong> street outage feed + personal light hours &amp; token spend</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span><strong>Fuel &amp; price watch:</strong> petrol, diesel, gas + rice, garri &amp; beans</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">•</span>
                <span><strong>Transport &amp; Verify:</strong> Lagos/Abuja/PH/Kano fares, flood alerts &amp; NAFDAC check</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="rounded-2xl bg-[#07241B] text-stone-100 border border-emerald-800/60 p-6 shadow-md relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-400 text-stone-950">
                [06:00, 11/21/2026] LIET
              </span>
              <span className="text-xs font-mono text-emerald-300">SHIPPED IN CODE • 10 TOOLS</span>
            </div>
            <p className="text-stone-100 font-medium mb-3">
              &ldquo;Naija Hub is built as an installable web app that works offline and runs on both Android and iPhone. I wrote the code and ran its calculation tests and a syntax check, but I haven&apos;t opened it in a browser or on a phone yet.&rdquo;
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {[
                "Light Tracker",
                "Fuel & Energy",
                "Price Watch",
                "Naira Rates",
                "Tax & VAT",
                "Split the Bill",
                "Ajo / Esusu",
                "Bill Reminders",
                "Codes & Emergency",
                "Scam Check",
              ].map((badge) => (
                <span
                  key={badge}
                  className="text-xs px-2.5 py-1 rounded-full bg-emerald-900/90 border border-emerald-700/60 text-emerald-100"
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* CHAPTER 01: 06:30 AM — TRANSPORT HELPER (DANFO / KEKE)     */}
        {/* ========================================================= */}
        <div className="space-y-28 md:space-y-36">
          <motion.article
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65 }}
            className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            {/* Left Media Reel: Video + Photo Inset */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200 bg-stone-950 aspect-[16/10] group">
                <video
                  src="https://videos.pexels.com/video-files/27706410/12209725_3840_2160_25fps.mp4"
                  poster="/images/story-dawn-commute.jpg"
                  autoPlay
                  loop
                  muted={mutedVideos.ch1}
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-mono text-xs font-bold">
                    CHAPTER 01 • 06:30 AM
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono">
                    Lagos Danfo Reel
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMute("ch1")}
                  aria-label="Toggle video sound"
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                >
                  {mutedVideos.ch1 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-amber-300 font-mono text-xs uppercase tracking-wider">
                      Lagos • Abuja • Port Harcourt • Kano
                    </p>
                    <p className="text-white font-semibold text-lg">
                      {lang === "en"
                        ? "Before you enter danfo or keke, know the real fare & flood spots."
                        : "Before you jump enter danfo or keke, sabi the real fare & water-log road."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary Photo Strip */}
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5 rounded-2xl overflow-hidden border border-stone-200 aspect-[4/3]">
                  <img
                    src="/images/story-dawn-commute.jpg"
                    alt="05:59 AM Lagos morning danfo commute"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="col-span-7 rounded-2xl bg-emerald-950 text-stone-100 p-4 border border-emerald-800/50">
                  <p className="font-mono text-xs text-amber-300 mb-1">
                    WEAK-DATA DESIGN
                  </p>
                  <p className="text-sm text-stone-200 leading-snug">
                    {lang === "en"
                      ? "Heavy map apps choke on 1-bar E/3G at bus stops. Cached corridor fares and flood flags load in under 15 KB."
                      : "Big map app dey hang when network drop for bus stop. Naija Hub cache bus-stop price so e dey open sharp-sharp."}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Interactive Module: Transport Helper */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-white border border-stone-200/90 shadow-sm p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-800 flex items-center justify-center">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-stone-950">
                        {lang === "en"
                          ? "Transport Helper & Flood Alerts"
                          : "Danfo / Keke Price & Flood Alert"}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {networkMode === "OFFLINE"
                          ? "Serving cached routes offline"
                          : "Live commuter corridor guide"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTransitForm((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-emerald-900 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {lang === "en" ? "Report Route" : "Drop Road Update"}
                  </button>
                </div>

                {/* City Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Lagos", "Abuja", "Port Harcourt", "Kano"].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(city)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                        selectedCity === city
                          ? "bg-emerald-900 text-white shadow-xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>

                {showTransitForm && (
                  <form
                    onSubmit={handleTransitSubmit}
                    className="mb-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <select
                        value={trMode}
                        onChange={(e) => setTrMode(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs font-medium"
                      >
                        <option value="Danfo">Danfo</option>
                        <option value="BRT">BRT / Bus</option>
                        <option value="Keke">Keke</option>
                        <option value="Bus / Along">Along Taxi</option>
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="From (e.g. Yaba)"
                        value={trFrom}
                        onChange={(e) => setTrFrom(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="To (e.g. Obalende)"
                        value={trTo}
                        onChange={(e) => setTrTo(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs col-span-2 sm:col-span-1"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <input
                        type="number"
                        placeholder="Min ₦"
                        value={trMin}
                        onChange={(e) => setTrMin(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Max ₦"
                        value={trMax}
                        onChange={(e) => setTrMax(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs font-mono"
                      />
                      <select
                        value={trAlert}
                        onChange={(e) => setTrAlert(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs font-medium"
                      >
                        <option value="CLEAR">Road Clear</option>
                        <option value="TRAFFIC">Go-Slow / Traffic</option>
                        <option value="FLOOD">Flood Alert</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Short traffic or flood note..."
                        value={trNote}
                        onChange={(e) => setTrNote(e.target.value)}
                        className="flex-1 rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
                      />
                      <button
                        type="submit"
                        disabled={submittingTransit}
                        className="px-4 py-2 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900"
                      >
                        {submittingTransit ? "Saving..." : "Post"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {filteredTransit.map((route) => (
                    <div
                      key={route.id}
                      className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-amber-400/30 text-stone-900 font-mono text-[11px] font-bold">
                            {route.mode}
                          </span>
                          <span className="font-semibold text-sm text-stone-900">
                            {route.fromStop} → {route.toStop}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 flex items-center gap-1.5">
                          {route.alertLevel === "FLOOD" ? (
                            <CloudRain className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          ) : route.alertLevel === "TRAFFIC" ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          <span>{route.alertNote}</span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <div className="font-mono font-bold text-sm text-emerald-950 tabular-nums">
                          {formatNaira(route.fareMinNgn)} – {formatNaira(route.fareMaxNgn)}
                        </div>
                        <span
                          className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                            route.alertLevel === "FLOOD"
                              ? "bg-sky-100 text-sky-800 font-semibold"
                              : route.alertLevel === "TRAFFIC"
                              ? "bg-amber-100 text-amber-800 font-semibold"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {route.alertLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">
                    {lang === "en"
                      ? "Driving your own car instead?"
                      : "You wan drive your own motor?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToUtility("fuel")}
                    className="font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
                  >
                    {lang === "en"
                      ? "Calculate Trip Fuel Cost →"
                      : "Check Motor Trip Fuel →"}
                  </button>
                </div>
              </div>
            </div>
          </motion.article>

          {/* ========================================================= */}
          {/* CHAPTER 02: 01:15 PM — CROWD FUEL & MARKET STAPLE WATCH   */}
          {/* ========================================================= */}
          <motion.article
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65 }}
            className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            {/* Left Interactive Module: Fuel & Market Price Watch */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-3xl bg-white border border-stone-200/90 shadow-sm p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-900/10 text-emerald-900 flex items-center justify-center">
                      <Fuel className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-stone-950">
                        {lang === "en"
                          ? "Fuel & Market Staples Watch"
                          : "Pump Price & Market Food Watch"}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {lang === "en"
                          ? "Crowd-sourced PMS, diesel, gas, rice, garri & beans"
                          : "Street price for petrol, gas, rice, garri & beans"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPriceForm((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-emerald-900 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {lang === "en" ? "Log Station / Market" : "Add Market Price"}
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  {(
                    [
                      ["ALL", lang === "en" ? "All Items" : "Everything"],
                      ["FUEL", lang === "en" ? "Fuel & Gas" : "Petrol & Gas"],
                      ["STAPLE", lang === "en" ? "Rice, Garri & Beans" : "Foodstuff"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPriceFilter(key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                        priceFilter === key
                          ? "bg-emerald-900 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {showPriceForm && (
                  <form
                    onSubmit={handlePriceSubmit}
                    className="mb-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <select
                        value={priceCat}
                        onChange={(e) =>
                          setPriceCat(e.target.value as "FUEL" | "STAPLE")
                        }
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
                      >
                        <option value="FUEL">Fuel / LPG</option>
                        <option value="STAPLE">Food Staple</option>
                      </select>
                      <select
                        value={priceItem}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPriceItem(val);
                          if (val.includes("Petrol") || val.includes("Diesel")) {
                            setPriceUnit("per Litre");
                          } else if (val.includes("Gas")) {
                            setPriceUnit("12.5kg Refill");
                          } else if (val.includes("Rice")) {
                            setPriceUnit("50kg Bag");
                          } else {
                            setPriceUnit("Paint Bucket (4L)");
                          }
                        }}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs col-span-1 sm:col-span-2"
                      >
                        <option value="PMS Petrol">PMS Petrol</option>
                        <option value="AGO Diesel">AGO Diesel</option>
                        <option value="Cooking Gas (LPG)">Cooking Gas (12.5kg)</option>
                        <option value="Local Destoned Rice">Local Rice (50kg)</option>
                        <option value="Yellow Garri (Ijebu)">Yellow Garri (Paint)</option>
                        <option value="Honey Beans (Oloyin)">Honey Beans (Paint)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        required
                        placeholder="Station / Market"
                        value={priceLoc}
                        onChange={(e) => setPriceLoc(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={priceCity}
                        onChange={(e) => setPriceCity(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Price ₦"
                        value={priceVal}
                        onChange={(e) => setPriceVal(e.target.value)}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-xs font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingPrice}
                      className="w-full py-2 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900"
                    >
                      {submittingPrice ? "Posting..." : "Submit Crowd Price"}
                    </button>
                  </form>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredPrices.slice(0, 6).map((p) => {
                    const diff = p.priceNgn - p.previousPriceNgn;
                    const isUp = diff > 0;
                    const isDown = diff < 0;
                    return (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl border border-stone-200/80 bg-stone-50/70 flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-200/80 text-stone-700">
                              {p.city} • {p.unit}
                            </span>
                            <h4 className="font-semibold text-sm text-stone-900 mt-1">
                              {p.itemName}
                            </h4>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-base text-stone-950 tabular-nums">
                              {formatNaira(p.priceNgn)}
                            </div>
                            <span
                              className={`inline-flex items-center text-[11px] font-mono font-semibold ${
                                isUp
                                  ? "text-rose-700"
                                  : isDown
                                  ? "text-emerald-700"
                                  : "text-stone-500"
                              }`}
                            >
                              {isUp && <ArrowUpRight className="w-3 h-3" />}
                              {isDown && <ArrowDownRight className="w-3 h-3" />}
                              {diff === 0
                                ? "No change"
                                : `${diff > 0 ? "+" : ""}${formatNaira(diff)}`}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-stone-500 mt-2 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                          <span className="truncate">{p.location}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">
                    {lang === "en"
                      ? "Want your own private market price notebook?"
                      : "You wan keep your own personal market price list?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToUtility("price")}
                    className="font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
                  >
                    {lang === "en"
                      ? "Open Personal Price Watch →"
                      : "Open My Price Notebook →"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Media Reel: Nigerian Market Video + Staples Editorial Photo */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200 bg-stone-950 aspect-[16/10] group">
                <video
                  src="https://videos.pexels.com/video-files/27165160/12087844_3840_2160_25fps.mp4"
                  poster="/images/story-market-fuel.jpg"
                  autoPlay
                  loop
                  muted={mutedVideos.ch2}
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-mono text-xs font-bold">
                    CHAPTER 02 • 01:15 PM
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono">
                    Bariga &amp; Wuse Market Reel
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMute("ch2")}
                  aria-label="Toggle market video sound"
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                >
                  {mutedVideos.ch2 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-amber-300 font-mono text-xs uppercase tracking-wider">
                    Pump Stations &amp; Staple Sacks
                  </p>
                  <p className="text-white font-semibold text-lg">
                    {lang === "en"
                      ? "From NNPC pump queues to Mile 12 garri & honey beans — know today's price before bargaining."
                      : "From filling station reach Mile 12 garri & oloyin beans — sabi today price before you price market."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-7 rounded-2xl bg-stone-900 text-stone-100 p-4">
                  <p className="font-mono text-xs text-amber-400 mb-1">
                    DELTA TRACKING
                  </p>
                  <p className="text-sm text-stone-200 leading-snug">
                    {lang === "en"
                      ? "Every entry compares automatically against the last logged price so your household budget spots spikes early."
                      : "Anytime you type new price, Naija Hub go show you sharp-sharp how much join or comot since last week."}
                  </p>
                </div>
                <div className="col-span-5 rounded-2xl overflow-hidden border border-stone-200 aspect-[4/3]">
                  <img
                    src="/images/story-market-fuel.jpg"
                    alt="Woven sacks of Nigerian rice, yellow garri, and honey beans"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.article>

          {/* ========================================================= */}
          {/* CHAPTER 03: 04:45 PM — VERIFY NAFDAC & SCAM PROTECTION    */}
          {/* ========================================================= */}
          <motion.article
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65 }}
            className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            {/* Left Editorial Visual */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200 aspect-[16/11] group">
                <img
                  src="/images/story-verify-shield.jpg"
                  alt="Checking NAFDAC registration number A4-1234 on antimalarial pack"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-mono text-xs font-bold">
                    CHAPTER 03 • 04:45 PM
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-amber-300 font-mono text-xs uppercase tracking-wider">
                    Verify &amp; Report • Consumer Safety
                  </p>
                  <p className="text-white font-semibold text-lg">
                    {lang === "en"
                      ? "Check NAFDAC numbers on medicines & water before buying — and spot fake bank alerts in seconds."
                      : "Confirm NAFDAC number for medicine & pure water before you buy — and catch fake alert sharp-sharp."}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Interactive NAFDAC Verifier */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-white border border-stone-200/90 shadow-sm p-6 sm:p-7">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/10 text-emerald-900 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-stone-950">
                      {lang === "en"
                        ? "Verify NAFDAC Reg. Number"
                        : "Check NAFDAC Number"}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {lang === "en"
                        ? "Try presets from cached Greenbook sample or inspect flagged batches"
                        : "Press sample code below make you test genuine vs fake alert"}
                    </p>
                  </div>
                </div>

                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={nafdacInput}
                    onChange={(e) => setNafdacInput(e.target.value)}
                    placeholder="Enter NAFDAC Reg No. (e.g. A4-1234)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {["A4-1234", "04-0192", "01-0844", "A7-4019", "B1-9999"].map(
                    (sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setNafdacInput(sample)}
                        className={`px-2.5 py-1 rounded-md font-mono text-xs border transition ${
                          normalizedNafdac === sample
                            ? "bg-emerald-950 text-amber-300 border-emerald-950"
                            : sample === "B1-9999"
                            ? "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                            : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                        }`}
                      >
                        {sample} {sample === "B1-9999" ? "(Flagged)" : ""}
                      </button>
                    )
                  )}
                </div>

                {matchedNafdac ? (
                  <div
                    className={`p-4 rounded-2xl border ${
                      matchedNafdac.status === "VERIFIED"
                        ? "bg-emerald-50/80 border-emerald-200"
                        : "bg-rose-50 border-rose-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                          matchedNafdac.status === "VERIFIED"
                            ? "bg-emerald-800 text-white"
                            : "bg-rose-700 text-white"
                        }`}
                      >
                        {matchedNafdac.status === "VERIFIED" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                        {matchedNafdac.status} • {matchedNafdac.regNumber}
                      </span>
                      <span className="text-xs text-stone-500">
                        {matchedNafdac.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-stone-950 text-base">
                      {matchedNafdac.productName}
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Manufacturer: <strong>{matchedNafdac.manufacturer}</strong>
                    </p>
                    <p className="text-xs text-stone-700 mt-2 leading-relaxed">
                      {matchedNafdac.guidance}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                    <p className="font-semibold">
                      Format Check:{" "}
                      {/^[A-Z0-9]{2}-[0-9]{4}[A-Z]?$/.test(normalizedNafdac)
                        ? "Valid NAFDAC alphanumeric pattern, not yet in local cache."
                        : "Unusual NAFDAC format — check hyphenated code on pack."}
                    </p>
                    <p>
                      Offline tip: For antimalarials &amp; antibiotics, scratch the panel and SMS the PIN to <strong>38353</strong> (free on all Nigerian networks).
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">
                    {lang === "en"
                      ? "Suspicious bank call, BVN message or fake alert?"
                      : "Person send you suspicious alert or BVN link?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToUtility("scam")}
                    className="font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-4"
                  >
                    {lang === "en"
                      ? "Open Scam Check & Blocklist →"
                      : "Open Shine Your Eye Tool →"}
                  </button>
                </div>
              </div>
            </div>
          </motion.article>

          {/* ========================================================= */}
          {/* CHAPTER 04: 07:20 PM — "UP NEPA!" & COMMUNITY FEEDER LOG  */}
          {/* ========================================================= */}
          <motion.article
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65 }}
            className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center"
          >
            {/* Left Interactive Module: Community Street Outage Feed */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-3xl bg-[#07241B] text-stone-100 border border-emerald-800/70 shadow-xl p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white">
                        {lang === "en"
                          ? "Community NEPA Street Tracker"
                          : "Street-by-Street NEPA Light Update"}
                      </h3>
                      <p className="text-xs text-emerald-300/90 flex items-center gap-1.5">
                        {networkMode === "OFFLINE" ? (
                          <>
                            <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                            <span>Offline cached feeder snapshot</span>
                          </>
                        ) : (
                          <>
                            <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                            <span>IKEDC • EKEDC • AEDC • PHED • KEDCO</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNepaForm((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-400 text-stone-950 hover:bg-amber-300 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {lang === "en" ? "Report Your Street" : "Update Your Street"}
                  </button>
                </div>

                {showNepaForm && (
                  <form
                    onSubmit={handleNepaSubmit}
                    className="mb-4 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-700/60 space-y-3"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={nepaCity}
                        onChange={(e) => setNepaCity(e.target.value)}
                        className="rounded-lg bg-emerald-900 border border-emerald-700 px-2.5 py-2 text-xs text-white"
                      >
                        <option value="Lagos">Lagos</option>
                        <option value="Abuja">Abuja</option>
                        <option value="Port Harcourt">Port Harcourt</option>
                        <option value="Kano">Kano</option>
                        <option value="Ibadan">Ibadan</option>
                      </select>
                      <select
                        value={nepaDisco}
                        onChange={(e) => setNepaDisco(e.target.value)}
                        className="rounded-lg bg-emerald-900 border border-emerald-700 px-2.5 py-2 text-xs text-white"
                      >
                        <option value="IKEDC">IKEDC</option>
                        <option value="EKEDC">EKEDC</option>
                        <option value="AEDC">AEDC</option>
                        <option value="PHED">PHED</option>
                        <option value="KEDCO">KEDCO</option>
                        <option value="IBEDC">IBEDC</option>
                      </select>
                      <select
                        value={nepaStatus}
                        onChange={(e) => setNepaStatus(e.target.value)}
                        className="rounded-lg bg-emerald-900 border border-emerald-700 px-2.5 py-2 text-xs text-amber-300 font-semibold"
                      >
                        <option value="ON">UP NEPA (ON)</option>
                        <option value="OFF">NO LIGHT (OFF)</option>
                        <option value="LOW_VOLTAGE">LOW VOLTAGE</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Area (e.g. Yaba)"
                        value={nepaArea}
                        onChange={(e) => setNepaArea(e.target.value)}
                        className="rounded-lg bg-emerald-900/70 border border-emerald-700 px-2.5 py-2 text-xs text-white placeholder:text-emerald-400/70"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Street name"
                        value={nepaStreet}
                        onChange={(e) => setNepaStreet(e.target.value)}
                        className="rounded-lg bg-emerald-900/70 border border-emerald-700 px-2.5 py-2 text-xs text-white placeholder:text-emerald-400/70"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Optional voltage / transformer note..."
                        value={nepaNote}
                        onChange={(e) => setNepaNote(e.target.value)}
                        className="flex-1 rounded-lg bg-emerald-900/70 border border-emerald-700 px-2.5 py-2 text-xs text-white placeholder:text-emerald-400/70"
                      />
                      <button
                        type="submit"
                        disabled={submittingNepa}
                        className="px-4 py-2 rounded-lg bg-amber-400 text-stone-950 text-xs font-bold hover:bg-amber-300"
                      >
                        {submittingNepa ? "..." : "Post"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2.5">
                  {nepaList.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-emerald-950/75 border border-emerald-800/70 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-white">
                            {item.area}, {item.city}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-200">
                            {item.disco} • {item.band}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-200/80 mt-0.5">
                          {item.street} — {item.note}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full font-mono text-xs font-bold ${
                          item.status === "ON"
                            ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                            : item.status === "LOW_VOLTAGE"
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-400/40"
                        }`}
                      >
                        {item.status === "ON"
                          ? "⚡ UP NEPA"
                          : item.status === "LOW_VOLTAGE"
                          ? "〰 LOW VOLT"
                          : "✕ OUTAGE"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-800/70 flex items-center justify-between text-xs">
                  <span className="text-emerald-300/80">
                    {lang === "en"
                      ? "Track your own flat's daily supply hours & meter tokens:"
                      : "Log your own house NEPA hour & prepaid token:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onJumpToUtility("light")}
                    className="font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-4"
                  >
                    {lang === "en" ? "Open Light Tracker →" : "Open Light Tracker →"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Media Reel: Flickering Bulb Video + Prepaid Meter Compound Photo */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200 bg-stone-950 aspect-[16/10] group">
                <video
                  src="https://videos.pexels.com/video-files/853772/853772-hd_1920_1080_25fps.mp4"
                  poster="/images/story-up-nepa.jpg"
                  autoPlay
                  loop
                  muted={mutedVideos.ch4}
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-mono text-xs font-bold">
                    CHAPTER 04 • 07:20 PM
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono">
                    &ldquo;Up NEPA!&rdquo; Moment
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMute("ch4")}
                  aria-label="Toggle bulb video sound"
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                >
                  {mutedVideos.ch4 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-amber-300 font-mono text-xs uppercase tracking-wider">
                    Grid vs Generator Economics
                  </p>
                  <p className="text-white font-semibold text-lg">
                    {lang === "en"
                      ? "Is your feeder really giving 20 hours for Band A tariff — and how much is your generator costing per kWh?"
                      : "Your Band A light really reach 20 hours every day? And how much your gen dey chop per kWh?"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-6 rounded-2xl overflow-hidden border border-stone-200 aspect-[16/10]">
                  <img
                    src="/images/story-up-nepa.jpg"
                    alt="Prepaid meter glowing green on Nigerian compound wall as veranda lights come on"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="col-span-6 rounded-2xl bg-amber-400/20 border border-amber-500/30 p-4">
                  <p className="font-mono text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> REAL TOKEN KWH MATH
                  </p>
                  <p className="text-xs sm:text-sm text-stone-800 leading-snug">
                    {lang === "en"
                      ? "Punch in ₦20,000 and your 20-digit token units: Naija Hub reveals your exact ₦/kWh vs petrol generator cost."
                      : "Put how much token you buy and the unit wey enter meter: you go see your true ₦/kWh sharp-sharp."}
                  </p>
                </div>
              </div>
            </div>
          </motion.article>

          {/* ========================================================= */}
          {/* CHAPTER 05: 09:00 PM — COMMUNITY AJO, PAYE & BILL SPLIT   */}
          {/* ========================================================= */}
          <motion.article
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65 }}
            className="rounded-3xl bg-stone-950 text-stone-100 p-6 sm:p-10 lg:p-12 border border-stone-800 shadow-2xl"
          >
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-mono text-xs font-bold">
                  CHAPTER 05 • 09:00 PM → 06:00 BUILD
                </span>
                <h3 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">
                  {lang === "en"
                    ? "Evening Ajo rounds, Friday suya splits, PAYE salary checks & USSD lifelines — all without touching mobile data."
                    : "Evening Ajo contribution, Friday suya bill share, salary PAYE check & bank USSD — zero data needed."}
                </h3>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  {lang === "en"
                    ? "Money trust is built in circles: monthly Esusu rotations, splitting delivery riders fairly, checking street FX before paying overseas tuition, and dialing *737# or 112 when data drops to zero. Below, step straight into LIET's full 10-utility app."
                    : "From monthly Esusu turn reach how una go share dispatch rider money or press *737# when data finish — test all 10 offline tools for browser or phone view right below."}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onJumpToUtility("ajo")}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 text-stone-950 font-semibold text-sm hover:bg-amber-300 transition"
                  >
                    {lang === "en" ? "Try Ajo / Esusu Tracker" : "Open Ajo / Esusu"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onJumpToUtility("split")}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 text-stone-100 font-semibold text-sm hover:bg-stone-700 border border-stone-700 transition"
                  >
                    {lang === "en" ? "Split a Suya Bill" : "Share Suya Bill"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onJumpToUtility("tax")}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 text-stone-100 font-semibold text-sm hover:bg-stone-700 border border-stone-700 transition"
                  >
                    {lang === "en" ? "Check PAYE & VAT" : "Check Salary Tax"}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden border border-stone-800 aspect-[4/4]">
                  <img
                    src="/images/story-ajo-esusu.jpg"
                    alt="Nigerian friends tracking monthly Ajo Esusu savings rotation together"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-stone-800 aspect-[4/4]">
                  <video
                    src="https://videos.pexels.com/video-files/28925673/12518915_3840_2160_30fps.mp4"
                    poster="/images/story-dawn-commute.jpg"
                    autoPlay
                    loop
                    muted={mutedVideos.ch5}
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <button
                    type="button"
                    onClick={() => toggleMute("ch5")}
                    aria-label="Toggle skyline video sound"
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white"
                  >
                    {mutedVideos.ch5 ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="font-mono text-[11px] text-amber-300">
                      LAGOS SKYLINE REEL
                    </span>
                    <p className="text-xs text-white font-medium">
                      Built for Android &amp; iPhone • Zero Cloud Lock-In
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

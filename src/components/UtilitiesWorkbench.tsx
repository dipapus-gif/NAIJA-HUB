"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertOctagon,
  ArrowLeftRight,
  BellRing,
  Calculator,
  Check,
  Copy,
  CreditCard,
  DollarSign,
  Fuel,
  HardDrive,
  Laptop,
  PhoneCall,
  Receipt,
  Search,
  ShieldAlert,
  Smartphone,
  Tag,
  Trash2,
  Users,
  WifiOff,
  Zap,
} from "lucide-react";
import { COPY, OFFLINE_CODES, type Lang } from "@/lib/i18n";
import {
  SCAM_FLAGS,
  calcAjoSchedule,
  calcDailySupplySummary,
  calcFxConversion,
  calcGeneratorVsNepa,
  calcNigeriaPaye,
  calcNigeriaVat,
  calcPriceDelta,
  calcRealCostPerKwh,
  calcSplitBill,
  calcTripFuelCost,
  evaluateScamRisk,
} from "@/lib/calculations";
import type { NaijaHubDeviceState } from "@/lib/localStore";

export type UtilityKey =
  | "light"
  | "fuel"
  | "price"
  | "rates"
  | "tax"
  | "split"
  | "ajo"
  | "bills"
  | "codes"
  | "scam";

interface UtilitiesWorkbenchProps {
  lang: Lang;
  activeUtility: UtilityKey;
  onSelectUtility: (key: UtilityKey) => void;
  deviceState: NaijaHubDeviceState;
  onUpdateDeviceState: (updater: (prev: NaijaHubDeviceState) => NaijaHubDeviceState) => void;
  referenceRates: { USD: number; GBP: number; EUR: number };
  storageBytes: number;
  networkMode: "ONLINE" | "WEAK_3G" | "OFFLINE";
  onOpenTestSuite: () => void;
}

function fmtNgn(val: number) {
  return `₦${Math.round(val).toLocaleString("en-NG")}`;
}

export function UtilitiesWorkbench({
  lang,
  activeUtility,
  onSelectUtility,
  deviceState,
  onUpdateDeviceState,
  referenceRates,
  storageBytes,
  networkMode,
  onOpenTestSuite,
}: UtilitiesWorkbenchProps) {
  const t = COPY[lang];
  const [viewFrame, setViewFrame] = useState<"STUDIO" | "PHONE">("STUDIO");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Light Tracker local form inputs
  const [tokenLabel, setTokenLabel] = useState("Home Prepaid Meter");
  const [tokenAmount, setTokenAmount] = useState("20000");
  const [tokenUnits, setTokenUnits] = useState("95.46");

  // 2. Fuel & Energy inputs
  const [genLitresHr, setGenLitresHr] = useState("1.2");
  const [genPumpPrice, setGenPumpPrice] = useState("995");
  const [genMaintHr, setGenMaintHr] = useState("120");
  const [genLoadKw, setGenLoadKw] = useState("1.8");
  const [nepaTariffKwh, setNepaTariffKwh] = useState("209.5");
  const [genDailyHours, setGenDailyHours] = useState("5");

  const [tripKm, setTripKm] = useState("42");
  const [tripL100, setTripL100] = useState("9.5");
  const [tripRound, setTripRound] = useState(true);
  const [tripPax, setTripPax] = useState("3");

  // 3. Personal Price Watch inputs
  const [pwItem, setPwItem] = useState("PMS Petrol");
  const [pwUnit, setPwUnit] = useState("1 Litre");
  const [pwMarket, setPwMarket] = useState("Conoil Yaba");
  const [pwPrice, setPwPrice] = useState("1015");

  // 4. Naira Rates inputs
  const [fxCurrency, setFxCurrency] = useState<"USD" | "GBP" | "EUR">("USD");
  const [fxAmount, setFxAmount] = useState("100");
  const [fxDirection, setFxDirection] = useState<
    "FOREIGN_TO_NGN" | "NGN_TO_FOREIGN"
  >("FOREIGN_TO_NGN");

  // 5. Tax & VAT inputs
  const [monthlyGross, setMonthlyGross] = useState("450000");
  const [includePension, setIncludePension] = useState(true);
  const [includeNhf, setIncludeNhf] = useState(false);
  const [vatInput, setVatInput] = useState("100000");
  const [vatMode, setVatMode] = useState<"ADD_VAT" | "EXTRACT_VAT">("ADD_VAT");

  // 6. Split the Bill inputs
  const [splitMode, setSplitMode] = useState<"ITEMIZED" | "EQUAL">("ITEMIZED");
  const [equalSubtotal, setEqualSubtotal] = useState("24000");
  const [equalCount, setEqualCount] = useState("4");
  const [sharedRiderFee, setSharedRiderFee] = useState("2500");
  const [sharedDist, setSharedDist] = useState<"EQUAL" | "PROPORTIONAL">(
    "EQUAL"
  );
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonOrder, setNewPersonOrder] = useState("");

  // 7. Ajo / Esusu inputs
  const [newAjoMember, setNewAjoMember] = useState("");

  // 8. Bill Reminders & Saved Beneficiaries inputs
  const [newBillTitle, setNewBillTitle] = useState("");
  const [newBillAmt, setNewBillAmt] = useState("");
  const [newBillDue, setNewBillDue] = useState("25");
  const [newBenLabel, setNewBenLabel] = useState("");
  const [newBenProvider, setNewBenProvider] = useState("IKEDC");
  const [newBenNum, setNewBenNum] = useState("");

  // 9. Codes & Emergency inputs
  const [codeSearch, setCodeSearch] = useState("");
  const [codeCat, setCodeCat] = useState<
    "ALL" | "BANK" | "TELECOM" | "VERIFY" | "EMERGENCY"
  >("ALL");

  // 10. Scam Check inputs
  const [selectedFlags, setSelectedFlags] = useState<string[]>([
    "fake-sms-alert",
  ]);
  const [scamSampleText, setScamSampleText] = useState("");
  const [blockNumber, setBlockNumber] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const copyText = (id: string, value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => undefined);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const utilityTabs: {
    key: UtilityKey;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    sub: string;
  }[] = [
    {
      key: "light",
      icon: Zap,
      label: t.utilities.light.name,
      sub: t.utilities.light.short,
    },
    {
      key: "fuel",
      icon: Fuel,
      label: t.utilities.fuel.name,
      sub: t.utilities.fuel.short,
    },
    {
      key: "price",
      icon: Tag,
      label: t.utilities.price.name,
      sub: t.utilities.price.short,
    },
    {
      key: "rates",
      icon: DollarSign,
      label: t.utilities.rates.name,
      sub: t.utilities.rates.short,
    },
    {
      key: "tax",
      icon: Calculator,
      label: t.utilities.tax.name,
      sub: t.utilities.tax.short,
    },
    {
      key: "split",
      icon: Receipt,
      label: t.utilities.split.name,
      sub: t.utilities.split.short,
    },
    {
      key: "ajo",
      icon: Users,
      label: t.utilities.ajo.name,
      sub: t.utilities.ajo.short,
    },
    {
      key: "bills",
      icon: BellRing,
      label: t.utilities.bills.name,
      sub: t.utilities.bills.short,
    },
    {
      key: "codes",
      icon: PhoneCall,
      label: t.utilities.codes.name,
      sub: t.utilities.codes.short,
    },
    {
      key: "scam",
      icon: ShieldAlert,
      label: t.utilities.scam.name,
      sub: t.utilities.scam.short,
    },
  ];

  // Derived calculations
  const supplySummary = useMemo(
    () => calcDailySupplySummary(deviceState.dailySupply7Days),
    [deviceState.dailySupply7Days]
  );

  const liveTokenPreview = useMemo(
    () => calcRealCostPerKwh(Number(tokenAmount) || 0, Number(tokenUnits) || 0),
    [tokenAmount, tokenUnits]
  );

  const genCompare = useMemo(
    () =>
      calcGeneratorVsNepa({
        fuelLitresPerHour: Number(genLitresHr) || 0,
        fuelPricePerLitreNgn: Number(genPumpPrice) || 0,
        hourlyMaintenanceNgn: Number(genMaintHr) || 0,
        averageLoadKw: Number(genLoadKw) || 1,
        nepaCostPerKwhNgn: Number(nepaTariffKwh) || 0,
        dailyGenHours: Number(genDailyHours) || 0,
      }),
    [
      genLitresHr,
      genPumpPrice,
      genMaintHr,
      genLoadKw,
      nepaTariffKwh,
      genDailyHours,
    ]
  );

  const tripEstimate = useMemo(
    () =>
      calcTripFuelCost({
        distanceKm: Number(tripKm) || 0,
        litresPer100Km: Number(tripL100) || 0,
        fuelPricePerLitreNgn: Number(genPumpPrice) || 995,
        roundTrip: tripRound,
        passengers: Number(tripPax) || 1,
      }),
    [tripKm, tripL100, genPumpPrice, tripRound, tripPax]
  );

  const activeFxRate = deviceState.useStreetRate
    ? deviceState.streetRates[fxCurrency]
    : referenceRates[fxCurrency];

  const fxResult = useMemo(
    () =>
      calcFxConversion({
        amount: Number(fxAmount) || 0,
        direction: fxDirection,
        activeRateNgn: activeFxRate,
        referenceRateNgn: referenceRates[fxCurrency],
      }),
    [fxAmount, fxDirection, activeFxRate, referenceRates, fxCurrency]
  );

  const payeResult = useMemo(
    () =>
      calcNigeriaPaye({
        monthlyGrossNgn: Number(monthlyGross) || 0,
        includePension,
        includeNhf,
      }),
    [monthlyGross, includePension, includeNhf]
  );

  const vatResult = useMemo(
    () => calcNigeriaVat(Number(vatInput) || 0, vatMode),
    [vatInput, vatMode]
  );

  const splitResult = useMemo(
    () =>
      calcSplitBill({
        mode: splitMode,
        equalTotalSubtotalNgn: Number(equalSubtotal) || 0,
        equalPeopleCount: Number(equalCount) || 2,
        participants: deviceState.splitParticipants,
        sharedDeliveryOrTipNgn: Number(sharedRiderFee) || 0,
        sharedDistribution: sharedDist,
      }),
    [
      splitMode,
      equalSubtotal,
      equalCount,
      deviceState.splitParticipants,
      sharedRiderFee,
      sharedDist,
    ]
  );

  const ajoSummary = useMemo(
    () =>
      calcAjoSchedule({
        contributionPerMemberNgn: deviceState.ajoContributionNgn,
        currentRoundIndex: deviceState.ajoCurrentRoundIndex,
        members: deviceState.ajoMembers,
      }),
    [
      deviceState.ajoContributionNgn,
      deviceState.ajoCurrentRoundIndex,
      deviceState.ajoMembers,
    ]
  );

  const scamEval = useMemo(
    () => evaluateScamRisk(selectedFlags, scamSampleText),
    [selectedFlags, scamSampleText]
  );

  const filteredCodes = useMemo(() => {
    const q = codeSearch.trim().toLowerCase();
    return OFFLINE_CODES.filter((item) => {
      const catOk = codeCat === "ALL" || item.category === codeCat;
      if (!catOk) return false;
      if (!q) return true;
      return (
        item.provider.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.titlePcm.toLowerCase().includes(q)
      );
    });
  }, [codeSearch, codeCat]);

  // Handlers
  const toggleNepaState = () => {
    onUpdateDeviceState((prev) => {
      const nextOn = !prev.nepaIsOn;
      const nowIso = new Date().toISOString();
      return {
        ...prev,
        nepaIsOn: nextOn,
        nepaLastChangedIso: nowIso,
        lightEvents: [
          {
            id: `le-${Date.now()}`,
            state: nextOn ? "ON" : "OFF",
            timestampIso: nowIso,
            note: nextOn
              ? lang === "en"
                ? "Up NEPA! Power restored"
                : "Up NEPA! Light don show"
              : lang === "en"
              ? "Grid power went off"
              : "NEPA don take light",
          },
          ...prev.lightEvents.slice(0, 9),
        ],
      };
    });
  };

  const addTokenPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(tokenAmount) || 0;
    const kwh = Number(tokenUnits) || 0;
    if (amt <= 0 || kwh <= 0) return;
    onUpdateDeviceState((prev) => ({
      ...prev,
      tokenPurchases: [
        {
          id: `tp-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          meterLabel: tokenLabel || "Prepaid Meter",
          amountNgn: amt,
          unitsKwh: kwh,
        },
        ...prev.tokenPurchases,
      ],
    }));
  };

  const addPersonalPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(pwPrice) || 0;
    if (price <= 0 || !pwItem.trim()) return;
    onUpdateDeviceState((prev) => {
      const lastSame = prev.personalPrices.find(
        (x) => x.item.toLowerCase() === pwItem.trim().toLowerCase()
      );
      return {
        ...prev,
        personalPrices: [
          {
            id: `pp-${Date.now()}`,
            item: pwItem.trim(),
            unit: pwUnit.trim() || "Standard",
            marketOrStation: pwMarket.trim() || "Local Market",
            priceNgn: price,
            previousPriceNgn: lastSame ? lastSame.priceNgn : null,
            date: "Just now",
          },
          ...prev.personalPrices,
        ],
      };
    });
  };

  return (
    <section
      id="utilities"
      className="py-20 md:py-28 bg-[#061A14] text-stone-100 relative overflow-hidden"
    >
      {/* Subtle Adire-inspired radial glow */}
      <div className="pointer-events-none absolute -top-40 right-0 w-[34rem] h-[34rem] rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 w-[28rem] h-[28rem] rounded-full bg-amber-500/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Workbench Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-amber-300 font-mono text-xs mb-3">
              <span>[06:00, 11/21/2026] • INSTALLABLE OFFLINE WEB APP</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
              {t.workbenchTitle}
            </h2>
            <p className="text-emerald-100/80 text-sm sm:text-base mt-2 leading-relaxed">
              {t.workbenchSub}
            </p>
          </div>

          {/* Device Frame Switcher + Test Runner Trigger */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-xl bg-emerald-950 p-1 border border-emerald-800">
              <button
                type="button"
                onClick={() => setViewFrame("STUDIO")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  viewFrame === "STUDIO"
                    ? "bg-amber-400 text-stone-950"
                    : "text-emerald-200 hover:text-white"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                {lang === "en" ? "Browser Studio" : "Big Screen"}
              </button>
              <button
                type="button"
                onClick={() => setViewFrame("PHONE")}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                  viewFrame === "PHONE"
                    ? "bg-amber-400 text-stone-950"
                    : "text-emerald-200 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                {lang === "en" ? "Phone View (iOS/Android)" : "Phone Screen"}
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenTestSuite}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-700 text-xs font-mono font-semibold text-emerald-100 transition"
            >
              <Check className="w-4 h-4 text-amber-400" />
              {t.ctaRunTests} (18/18)
            </button>
          </div>
        </div>

        {/* Local-Only Privacy Strip */}
        <div className="mb-8 rounded-2xl bg-emerald-950/90 border border-emerald-800/70 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-100">
            <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t.privacyBanner}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-emerald-300">
            <span>
              Device Store: {(storageBytes / 1024).toFixed(1)} KB
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-900 text-amber-300">
              {networkMode === "OFFLINE"
                ? "AIRPLANE OFFLINE READY"
                : networkMode === "WEAK_3G"
                ? "WEAK 3G SAFE (0 KB API)"
                : "LOCAL-FIRST ACTIVE"}
            </span>
          </div>
        </div>

        {/* 10 Utility Selector Rail / Bento Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-8">
          {utilityTabs.map((u, idx) => {
            const Icon = u.icon;
            const active = activeUtility === u.key;
            return (
              <button
                key={u.key}
                type="button"
                onClick={() => onSelectUtility(u.key)}
                className={`text-left p-3.5 rounded-2xl border transition-all ${
                  active
                    ? "bg-amber-400 text-stone-950 border-amber-300 shadow-lg shadow-amber-500/10 -translate-y-0.5"
                    : "bg-emerald-950/75 text-stone-100 border-emerald-800/70 hover:bg-emerald-900/70 hover:border-emerald-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon
                    className={`w-4 h-4 ${
                      active ? "text-stone-950" : "text-amber-400"
                    }`}
                  />
                  <span
                    className={`font-mono text-[10px] ${
                      active ? "text-stone-800 font-bold" : "text-emerald-400"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="font-semibold text-xs sm:text-sm truncate">
                  {u.label}
                </div>
                <div
                  className={`text-[11px] line-clamp-1 mt-0.5 ${
                    active ? "text-stone-800" : "text-emerald-300/75"
                  }`}
                >
                  {u.sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Utility Stage (Either Full Studio Card OR Authentic Phone Bezel) */}
        <div
          className={
            viewFrame === "PHONE"
              ? "max-w-[430px] mx-auto rounded-[2.75rem] p-3.5 bg-stone-950 border-[6px] border-stone-800 shadow-2xl"
              : ""
          }
        >
          {viewFrame === "PHONE" && (
            <div className="px-5 pt-2 pb-3 flex items-center justify-between text-[11px] font-mono text-stone-300 border-b border-stone-800 mb-3">
              <span>06:00</span>
              <span className="px-3 py-0.5 rounded-full bg-stone-900 text-amber-300 text-[10px]">
                Naija Hub PWA • Offline
              </span>
              <span className="flex items-center gap-1">
                {networkMode === "OFFLINE" ? (
                  <WifiOff className="w-3 h-3 text-amber-400" />
                ) : (
                  "3G ▂▄"
                )}
              </span>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeUtility}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="rounded-3xl bg-[#FAF8F4] text-stone-900 p-5 sm:p-8 shadow-2xl border border-stone-200"
            >
              {/* ===================================================== */}
              {/* 01. LIGHT TRACKER                                     */}
              {/* ===================================================== */}
              {activeUtility === "light" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                    <div>
                      <span className="font-mono text-xs uppercase text-emerald-800 font-bold">
                        UTILITY 01 • LIGHT TRACKER
                      </span>
                      <h3 className="font-display text-2xl font-bold text-stone-950">
                        {lang === "en"
                          ? "One-Tap NEPA Log, Daily Hours & Token kWh Cost"
                          : "One-Tap NEPA Switch, Supply Hours & Token Maths"}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={toggleNepaState}
                      className={`px-6 py-3.5 rounded-2xl font-display font-bold text-sm sm:text-base shadow-md transition flex items-center gap-2.5 cursor-pointer ${
                        deviceState.nepaIsOn
                          ? "bg-emerald-700 text-white hover:bg-emerald-800"
                          : "bg-stone-900 text-amber-300 hover:bg-stone-800"
                      }`}
                    >
                      <Zap className="w-5 h-5 fill-current" />
                      {deviceState.nepaIsOn
                        ? lang === "en"
                          ? "GRID IS ON — Tap if NEPA Takes Light"
                          : "LIGHT DEY — Tap if NEPA Take Light"
                        : lang === "en"
                        ? "OUTAGE — Tap 'UP NEPA!' When Back"
                        : "NO LIGHT — Tap 'UP NEPA!' When E Show"}
                    </button>
                  </div>

                  <div
                    className={`grid gap-6 ${
                      viewFrame === "PHONE" ? "grid-cols-1" : "lg:grid-cols-12"
                    }`}
                  >
                    {/* 7-day Supply Hours Chart + Log */}
                    <div
                      className={`${
                        viewFrame === "PHONE" ? "" : "lg:col-span-6"
                      } space-y-4`}
                    >
                      <div className="p-4 rounded-2xl bg-white border border-stone-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono font-bold uppercase text-stone-500">
                            {lang === "en"
                              ? "7-Day Supply Hours (Tap Bars to Adjust)"
                              : "7-Day Light Hours (Touch Bar Change Am)"}
                          </span>
                          <span className="font-mono text-sm font-bold text-emerald-800">
                            Avg: {supplySummary.averageHours} hrs/day
                          </span>
                        </div>

                        <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4">
                          {deviceState.dailySupply7Days.map((d, i) => {
                            const pct = Math.min(100, Math.round((d.hours / 24) * 100));
                            return (
                              <button
                                key={d.day}
                                type="button"
                                title="Click to cycle hours"
                                onClick={() =>
                                  onUpdateDeviceState((prev) => {
                                    const next = [...prev.dailySupply7Days];
                                    const bumped =
                                      next[i].hours + 2 > 24
                                        ? 4
                                        : Number((next[i].hours + 2).toFixed(1));
                                    next[i] = { ...next[i], hours: bumped };
                                    return { ...prev, dailySupply7Days: next };
                                  })
                                }
                                className="flex flex-col items-center h-full justify-end group"
                              >
                                <span className="text-[10px] font-mono text-stone-600 mb-1 tabular-nums">
                                  {d.hours}h
                                </span>
                                <div className="w-full bg-stone-100 rounded-t-lg h-24 flex items-end overflow-hidden">
                                  <div
                                    style={{ height: `${pct}%` }}
                                    className={`w-full rounded-t-lg transition-all ${
                                      d.hours >= 18
                                        ? "bg-emerald-600"
                                        : d.hours >= 10
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                    } group-hover:opacity-80`}
                                  />
                                </div>
                                <span className="text-[11px] font-semibold text-stone-700 mt-1">
                                  {d.day}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-3 pt-2 border-t border-stone-100 flex justify-between text-xs text-stone-500 font-mono">
                          <span>Best: {supplySummary.bestDay}</span>
                          <span>Lowest: {supplySummary.worstDay}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-stone-200">
                        <h4 className="text-xs font-mono uppercase font-bold text-stone-500 mb-2.5">
                          {lang === "en" ? "Recent Switch Log" : "Recent Light Log"}
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {deviceState.lightEvents.map((ev) => (
                            <div
                              key={ev.id}
                              className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded font-mono font-bold ${
                                    ev.state === "ON"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-stone-200 text-stone-800"
                                  }`}
                                >
                                  {ev.state}
                                </span>
                                <span className="text-stone-700">{ev.note}</span>
                              </div>
                              <span className="font-mono text-stone-400">
                                {new Date(ev.timestampIso).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Prepaid Meter Token Real Cost per kWh */}
                    <div
                      className={`${
                        viewFrame === "PHONE" ? "" : "lg:col-span-6"
                      } space-y-4`}
                    >
                      <form
                        onSubmit={addTokenPurchase}
                        className="p-5 rounded-2xl bg-emerald-950 text-stone-100 space-y-4"
                      >
                        <div>
                          <h4 className="font-display font-bold text-lg text-white">
                            {lang === "en"
                              ? "Prepaid Token Real Cost per kWh"
                              : "Prepaid Token True Cost per kWh"}
                          </h4>
                          <p className="text-xs text-emerald-300">
                            {lang === "en"
                              ? "Enter Naira paid & kWh units printed on your token receipt"
                              : "Put how much you pay & the kWh unit wey show for receipt"}
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono text-emerald-300 mb-1">
                              Meter Name
                            </label>
                            <input
                              type="text"
                              value={tokenLabel}
                              onChange={(e) => setTokenLabel(e.target.value)}
                              className="w-full rounded-xl bg-emerald-900/80 border border-emerald-700 px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-emerald-300 mb-1">
                              Amount Paid (₦)
                            </label>
                            <input
                              type="number"
                              value={tokenAmount}
                              onChange={(e) => setTokenAmount(e.target.value)}
                              className="w-full rounded-xl bg-emerald-900/80 border border-emerald-700 px-3 py-2 text-xs font-mono text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-emerald-300 mb-1">
                              Units (kWh)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={tokenUnits}
                              onChange={(e) => setTokenUnits(e.target.value)}
                              className="w-full rounded-xl bg-emerald-900/80 border border-emerald-700 px-3 py-2 text-xs font-mono text-white"
                            />
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-900/90 border border-emerald-700/80 flex items-center justify-between">
                          <div>
                            <div className="text-[11px] font-mono text-emerald-300">
                              REAL COST PER KWH
                            </div>
                            <div className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
                              ₦{liveTokenPreview.costPerKwh}/kWh
                            </div>
                            <div className="text-xs text-emerald-200 mt-0.5">
                              {liveTokenPreview.estimatedBand} • Est. 7.5% VAT:{" "}
                              {fmtNgn(liveTokenPreview.vatPortionNgn)}
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="px-4 py-2.5 rounded-xl bg-amber-400 text-stone-950 font-semibold text-xs hover:bg-amber-300"
                          >
                            {lang === "en" ? "Save Token" : "Save Receipt"}
                          </button>
                        </div>
                      </form>

                      <div className="p-4 rounded-2xl bg-white border border-stone-200">
                        <h4 className="text-xs font-mono uppercase font-bold text-stone-500 mb-2.5">
                          Saved Token History
                        </h4>
                        <div className="space-y-2">
                          {deviceState.tokenPurchases.map((tp) => {
                            const c = calcRealCostPerKwh(tp.amountNgn, tp.unitsKwh);
                            return (
                              <div
                                key={tp.id}
                                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-stone-50 border border-stone-100"
                              >
                                <div>
                                  <div className="font-semibold text-stone-900">
                                    {tp.meterLabel}
                                  </div>
                                  <div className="text-stone-500 font-mono">
                                    {tp.date} • {tp.unitsKwh} kWh
                                  </div>
                                </div>
                                <div className="text-right font-mono">
                                  <div className="font-bold text-stone-950">
                                    {fmtNgn(tp.amountNgn)}
                                  </div>
                                  <div className="text-emerald-800 font-semibold">
                                    ₦{c.costPerKwh}/kWh
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* 02. FUEL & ENERGY                                     */}
              {/* ===================================================== */}
              {activeUtility === "fuel" && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-stone-200">
                    <span className="font-mono text-xs uppercase text-emerald-800 font-bold">
                      UTILITY 02 • FUEL &amp; ENERGY
                    </span>
                    <h3 className="font-display text-2xl font-bold text-stone-950">
                      {lang === "en"
                        ? "Generator vs NEPA Cost/kWh + Road Trip Fuel Calculator"
                        : "Generator vs NEPA kWh Cost + Motor Trip Fuel"}
                    </h3>
                  </div>

                  <div
                    className={`grid gap-6 ${
                      viewFrame === "PHONE" ? "grid-cols-1" : "lg:grid-cols-2"
                    }`}
                  >
                    {/* Gen vs NEPA */}
                    <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4">
                      <h4 className="font-display font-bold text-lg text-stone-950">
                        1. Generator vs Prepaid NEPA (per kWh)
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-stone-500 mb-1">
                            Gen Burn (L/hr)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={genLitresHr}
                            onChange={(e) => setGenLitresHr(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-500 mb-1">
                            Fuel Price (₦/L)
                          </label>
                          <input
                            type="number"
                            value={genPumpPrice}
                            onChange={(e) => setGenPumpPrice(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-500 mb-1">
                            Oil/Maint (₦/hr)
                          </label>
                          <input
                            type="number"
                            value={genMaintHr}
                            onChange={(e) => setGenMaintHr(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-500 mb-1">
                            Avg Load (kW)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={genLoadKw}
                            onChange={(e) => setGenLoadKw(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-500 mb-1">
                            NEPA (₦/kWh)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={nepaTariffKwh}
                            onChange={(e) => setNepaTariffKwh(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-500 mb-1">
                            Gen Hrs/Day
                          </label>
                          <input
                            type="number"
                            value={genDailyHours}
                            onChange={(e) => setGenDailyHours(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-300 font-mono">
                            GENERATOR REAL KWH COST
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-mono text-xs font-bold">
                            {genCompare.multiplier}x NEPA
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-1">
                          <div>
                            <div className="text-xs text-emerald-300">Gen / kWh</div>
                            <div className="font-mono text-2xl font-bold text-amber-300">
                              ₦{genCompare.genCostPerKwhNgn}
                            </div>
                            <div className="text-[11px] text-emerald-200 font-mono">
                              30d: {fmtNgn(genCompare.monthlyGenNgn)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-emerald-300">NEPA / kWh</div>
                            <div className="font-mono text-2xl font-bold text-white">
                              ₦{genCompare.nepaCostPerKwhNgn}
                            </div>
                            <div className="text-[11px] text-emerald-200 font-mono">
                              30d: {fmtNgn(genCompare.monthlyNepaNgn)}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-emerald-200 pt-2 border-t border-emerald-800">
                          Extra monthly burn running generator:{" "}
                          <strong className="text-amber-300 font-mono">
                            {fmtNgn(genCompare.monthlyExtraSpendNgn)}/mo
                          </strong>
                        </p>
                      </div>
                    </div>

                    {/* Trip Fuel Cost */}
                    <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4">
                      <h4 className="font-display font-bold text-lg text-stone-950">
                        2. Trip Fuel Cost Estimator
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-stone-500 mb-1">
                            One-Way Distance (km)
                          </label>
                          <input
                            type="number"
                            value={tripKm}
                            onChange={(e) => setTripKm(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-500 mb-1">
                            Car Economy (L / 100km)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={tripL100}
                            onChange={(e) => setTripL100(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-500 mb-1">
                            Split Among Passengers
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={tripPax}
                            onChange={(e) => setTripPax(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => setTripRound((r) => !r)}
                            className={`w-full py-2 px-3 rounded-xl font-semibold border transition ${
                              tripRound
                                ? "bg-emerald-900 text-white border-emerald-900"
                                : "bg-stone-100 text-stone-700 border-stone-300"
                            }`}
                          >
                            {tripRound ? "✓ Round Trip (Go & Come)" : "One-Way Only"}
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-2">
                        <div className="flex justify-between text-xs font-mono text-stone-400">
                          <span>Distance: {tripEstimate.effectiveDistanceKm} km</span>
                          <span>Fuel: {tripEstimate.litresNeeded} Litres</span>
                        </div>
                        <div className="flex items-baseline justify-between pt-1">
                          <div>
                            <div className="text-xs text-stone-400">Total Trip Fuel</div>
                            <div className="font-mono text-2xl font-bold text-amber-400">
                              {fmtNgn(tripEstimate.totalFuelCostNgn)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-stone-400">Each Person Pays</div>
                            <div className="font-mono text-xl font-bold text-emerald-400">
                              {fmtNgn(tripEstimate.perPassengerNgn)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* 03. PERSONAL PRICE WATCH                              */}
              {/* ===================================================== */}
              {activeUtility === "price" && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-stone-200">
                    <span className="font-mono text-xs uppercase text-emerald-800 font-bold">
                      UTILITY 03 • PERSONAL PRICE WATCH
                    </span>
                    <h3 className="font-display text-2xl font-bold text-stone-950">
                      {lang === "en"
                        ? "Log Fuel & Market Prices — See Change Since Last Entry"
                        : "Log Fuel & Market Price — See Wetin Join Since Last Time"}
                    </h3>
                  </div>

                  <form
                    onSubmit={addPersonalPrice}
                    className="p-4 rounded-2xl bg-white border border-stone-200 grid sm:grid-cols-5 gap-3 items-end"
                  >
                    <div>
                      <label className="block text-[11px] font-mono text-stone-500 mb-1">
                        Item
                      </label>
                      <input
                        type="text"
                        list="naija-staples"
                        value={pwItem}
                        onChange={(e) => setPwItem(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs"
                      />
                      <datalist id="naija-staples">
                        <option value="PMS Petrol" />
                        <option value="Cooking Gas (LPG)" />
                        <option value="Yellow Garri (Ijebu)" />
                        <option value="Honey Beans (Oloyin)" />
                        <option value="Local Rice (50kg)" />
                        <option value="Crate of Eggs" />
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-500 mb-1">
                        Measure / Unit
                      </label>
                      <input
                        type="text"
                        value={pwUnit}
                        onChange={(e) => setPwUnit(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-500 mb-1">
                        Station or Market
                      </label>
                      <input
                        type="text"
                        value={pwMarket}
                        onChange={(e) => setPwMarket(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-500 mb-1">
                        Price (₦)
                      </label>
                      <input
                        type="number"
                        value={pwPrice}
                        onChange={(e) => setPwPrice(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2.5 px-4 rounded-xl bg-emerald-900 text-white text-xs font-semibold hover:bg-emerald-950"
                    >
                      + Log Entry
                    </button>
                  </form>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {deviceState.personalPrices.map((entry) => {
                      const delta = calcPriceDelta(
                        entry.priceNgn,
                        entry.previousPriceNgn
                      );
                      return (
                        <div
                          key={entry.id}
                          className="p-4 rounded-2xl bg-white border border-stone-200 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-bold text-stone-950 text-sm">
                              {entry.item}{" "}
                              <span className="font-normal text-xs text-stone-500">
                                ({entry.unit})
                              </span>
                            </div>
                            <div className="text-xs text-stone-500 mt-0.5">
                              {entry.marketOrStation} • {entry.date}
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-lg font-bold text-stone-950">
                              {fmtNgn(entry.priceNgn)}
                            </div>
                            {delta.direction === "FIRST" ? (
                              <span className="text-[11px] text-stone-400">
                                Baseline entry
                              </span>
                            ) : (
                              <span
                                className={`text-xs font-semibold ${
                                  delta.direction === "UP"
                                    ? "text-rose-700"
                                    : delta.direction === "DOWN"
                                    ? "text-emerald-700"
                                    : "text-stone-500"
                                }`}
                              >
                                {delta.diffNgn > 0 ? "+" : ""}
                                {fmtNgn(delta.diffNgn)} ({delta.pctChange}%)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* 04. NAIRA RATES (FX)                                  */}
              {/* ===================================================== */}
              {activeUtility === "rates" && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs uppercase text-emerald-800 font-bold">
                        UTILITY 04 • NAIRA RATES
                      </span>
                      <h3 className="font-display text-2xl font-bold text-stone-950">
                        {lang === "en"
                          ? "Convert USD, GBP & EUR — Official Reference vs Street Rate"
                          : "Change Dollar, Pound & Euro — Official vs Aboki Street Rate"}
                      </h3>
                    </div>

                    <div className="inline-flex rounded-xl bg-stone-200/80 p-1">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateDeviceState((p) => ({
                            ...p,
                            useStreetRate: false,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          !deviceState.useStreetRate
                            ? "bg-white text-stone-950 shadow-xs"
                            : "text-stone-600"
                        }`}
                      >
                        Fetched Ref Rate
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateDeviceState((p) => ({
                            ...p,
                            useStreetRate: true,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          deviceState.useStreetRate
                            ? "bg-emerald-900 text-white shadow-xs"
                            : "text-stone-600"
                        }`}
                      >
                        Custom Street Rate
                      </button>
                    </div>
                  </div>

                  <div
                    className={`grid gap-6 ${
                      viewFrame === "PHONE" ? "grid-cols-1" : "lg:grid-cols-12"
                    }`}
                  >
                    <div
                      className={`${
                        viewFrame === "PHONE" ? "" : "lg:col-span-7"
                      } p-5 rounded-2xl bg-white border border-stone-200 space-y-4`}
                    >
                      <div className="flex gap-2">
                        {(["USD", "GBP", "EUR"] as const).map((cur) => (
                          <button
                            key={cur}
                            type="button"
                            onClick={() => setFxCurrency(cur)}
                            className={`flex-1 py-2.5 rounded-xl font-mono font-bold text-sm border transition ${
                              fxCurrency === cur
                                ? "bg-emerald-950 text-amber-300 border-emerald-950"
                                : "bg-stone-50 text-stone-700 border-stone-200"
                            }`}
                          >
                            {cur === "USD" ? "$ USD" : cur === "GBP" ? "£ GBP" : "€ EUR"}
                          </button>
                        ))}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">
                            {fxDirection === "FOREIGN_TO_NGN"
                              ? `Amount in ${fxCurrency}`
                              : "Amount in Naira (₦)"}
                          </label>
                          <input
                            type="number"
                            value={fxAmount}
                            onChange={(e) => setFxAmount(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-base font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-stone-500 mb-1">
                            {deviceState.useStreetRate
                              ? `Your ${fxCurrency} Street Rate (₦)`
                              : `NAFEM Ref ${fxCurrency} Rate (₦)`}
                          </label>
                          <input
                            type="number"
                            disabled={!deviceState.useStreetRate}
                            value={activeFxRate}
                            onChange={(e) => {
                              const v = Number(e.target.value) || 0;
                              onUpdateDeviceState((prev) => ({
                                ...prev,
                                streetRates: {
                                  ...prev.streetRates,
                                  [fxCurrency]: v,
                                },
                              }));
                            }}
                            className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-base font-bold disabled:bg-stone-100"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFxDirection((d) =>
                            d === "FOREIGN_TO_NGN"
                              ? "NGN_TO_FOREIGN"
                              : "FOREIGN_TO_NGN"
                          )
                        }
                        className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        Swap Direction (
                        {fxDirection === "FOREIGN_TO_NGN"
                          ? `${fxCurrency} → NGN`
                          : `NGN → ${fxCurrency}`}
                        )
                      </button>
                    </div>

                    <div
                      className={`${
                        viewFrame === "PHONE" ? "" : "lg:col-span-5"
                      } p-6 rounded-2xl bg-emerald-950 text-white flex flex-col justify-between`}
                    >
                      <div>
                        <span className="font-mono text-xs text-emerald-300 uppercase">
                          Converted Value
                        </span>
                        <div className="font-mono text-3xl sm:text-4xl font-bold text-amber-300 mt-2 tabular-nums">
                          {fxDirection === "FOREIGN_TO_NGN"
                            ? fmtNgn(fxResult.converted)
                            : `${
                                fxCurrency === "USD"
                                  ? "$"
                                  : fxCurrency === "GBP"
                                  ? "£"
                                  : "€"
                              }${fxResult.converted.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}`}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-emerald-800 text-xs font-mono space-y-1 text-emerald-200">
                        <div className="flex justify-between">
                          <span>NAFEM Official Ref:</span>
                          <span>₦{referenceRates[fxCurrency]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Street vs Ref Spread:</span>
                          <span className="text-amber-300 font-bold">
                            {fxResult.spreadNgn >= 0 ? "+" : ""}₦
                            {fxResult.spreadNgn} ({fxResult.spreadPct}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* 05. TAX & VAT (PAYE + 7.5% VAT)                       */}
              {/* ===================================================== */}
              {activeUtility === "tax" && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-stone-200">
                    <span className="font-mono text-xs uppercase text-emerald-800 font-bold">
                      UTILITY 05 • TAX &amp; VAT
                    </span>
                    <h3 className="font-display text-2xl font-bold text-stone-950">
                      {lang === "en"
                        ? "Nigeria PAYE Take-Home Salary & 7.5% VAT Calculator"
                        : "Naija Salary PAYE Take-Home & 7.5% VAT Calculator"}
                    </h3>
                  </div>

                  <div
                    className={`grid gap-6 ${
                      viewFrame === "PHONE" ? "grid-cols-1" : "lg:grid-cols-2"
                    }`}
                  >
                    {/* PAYE */}
                    <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4">
                      <h4 className="font-display font-bold text-lg text-stone-950">
                        1. Monthly PAYE Take-Home Estimate
                      </h4>
                      <div>
                        <label className="block text-xs text-stone-500 mb-1">
                          Monthly Gross Income (₦)
                        </label>
                        <input
                          type="number"
                          value={monthlyGross}
                          onChange={(e) => setMonthlyGross(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-base font-bold"
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includePension}
                            onChange={(e) => setIncludePension(e.target.checked)}
                            className="rounded text-emerald-800"
                          />
                          <span>Deduct 8% Pension</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeNhf}
                            onChange={(e) => setIncludeNhf(e.target.checked)}
                            className="rounded text-emerald-800"
                          />
                          <span>Deduct 2.5% NHF</span>
                        </label>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2">
                        <div className="text-xs font-mono text-emerald-300">
                          ESTIMATED MONTHLY TAKE-HOME PAY
                        </div>
                        <div className="font-mono text-3xl font-bold text-amber-300 tabular-nums">
                          {fmtNgn(payeResult.monthlyNetTakeHome)}
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-800 text-xs font-mono">
                          <div>
                            <span className="text-emerald-300 block">PAYE/mo</span>
                            <span>{fmtNgn(payeResult.monthlyTax)}</span>
                          </div>
                          <div>
                            <span className="text-emerald-300 block">Pension</span>
                            <span>{fmtNgn(payeResult.monthlyPension)}</span>
                          </div>
                          <div>
                            <span className="text-emerald-300 block">Eff. Tax</span>
                            <span>{payeResult.effectiveTaxRatePct}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 7.5% VAT */}
                    <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4">
                      <h4 className="font-display font-bold text-lg text-stone-950">
                        2. Nigerian 7.5% VAT Calculator
                      </h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setVatMode("ADD_VAT")}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                            vatMode === "ADD_VAT"
                              ? "bg-stone-900 text-white border-stone-900"
                              : "bg-stone-50 text-stone-700 border-stone-200"
                          }`}
                        >
                          Add 7.5% VAT to Net
                        </button>
                        <button
                          type="button"
                          onClick={() => setVatMode("EXTRACT_VAT")}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                            vatMode === "EXTRACT_VAT"
                              ? "bg-stone-900 text-white border-stone-900"
                              : "bg-stone-50 text-stone-700 border-stone-200"
                          }`}
                        >
                          Extract VAT from Total
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs text-stone-500 mb-1">
                          {vatMode === "ADD_VAT"
                            ? "Invoice Net Amount (₦)"
                            : "VAT-Inclusive Receipt Total (₦)"}
                        </label>
                        <input
                          type="number"
                          value={vatInput}
                          onChange={(e) => setVatInput(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-base font-bold"
                        />
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-2 font-mono text-sm">
                        <div className="flex justify-between">
                          <span className="text-stone-400">Net (Excl. VAT):</span>
                          <span>₦{vatResult.netAmount.toLocaleString("en-NG")}</span>
                        </div>
                        <div className="flex justify-between text-amber-400">
                          <span>7.5% FIRS VAT:</span>
                          <span>₦{vatResult.vatAmount.toLocaleString("en-NG")}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-stone-700 text-base font-bold text-emerald-400">
                          <span>Gross Total:</span>
                          <span>₦{vatResult.grossTotal.toLocaleString("en-NG")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* 06. SPLIT THE BILL                                    */}
              {/* ===================================================== */}
              {activeUtility === "split" && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs uppercase text-emerald-800 font-bold">
                        UTILITY 06 • SPLIT THE BILL
                      </span>
                      <h3 className="font-display text-2xl font-bold text-stone-950">
                        {lang === "en"
                          ? "Equal Split or Pay What You Ordered + Shared Delivery/Tip"
                          : "Share Equal-Equal or Pay Wetin You Chop + Rider Money"}
                      </h3>
                    </div>

                    <div className="inline-flex rounded-xl bg-stone-200/80 p-1">
                      <button
                        type="button"
                        onClick={() => setSplitMode("ITEMIZED")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          splitMode === "ITEMIZED"
                            ? "bg-emerald-900 text-white"
                            : "text-stone-700"
                        }`}
                      >
                        {lang === "en" ? "By Order" : "Wetin You Chop"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitMode("EQUAL")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          splitMode === "EQUAL"
                            ? "bg-emerald-900 text-white"
                            : "text-stone-700"
                        }`}
                      >
                        {lang === "en" ? "Equal Split" : "Equal-Equal"}
                      </button>
                    </div>
                  </div>

                  <div
                    className={`grid gap-6 ${
                      viewFrame === "PHONE" ? "grid-cols-1" : "lg:grid-cols-12"
                    }`}
                  >
                    <div
                      className={`${
                        viewFrame === "PHONE" ? "" : "lg:col-span-7"
                      } space-y-4`}
                    >
                      {splitMode === "EQUAL" ? (
                        <div className="p-5 rounded-2xl bg-white border border-stone-200 grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-stone-500 mb-1">
                              Food / Drinks Subtotal (₦)
                            </label>
                            <input
                              type="number"
                              value={equalSubtotal}
                              onChange={(e) => setEqualSubtotal(e.target.value)}
                              className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-stone-500 mb-1">
                              Number of People
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={equalCount}
                              onChange={(e) => setEqualCount(e.target.value)}
                              className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono font-bold"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
                          <div className="space-y-2">
                            {deviceState.splitParticipants.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center gap-2 text-xs"
                              >
                                <input
                                  type="text"
                                  value={p.name}
                                  onChange={(e) =>
                                    onUpdateDeviceState((prev) => ({
                                      ...prev,
                                      splitParticipants:
                                        prev.splitParticipants.map((item) =>
                                          item.id === p.id
                                            ? { ...item, name: e.target.value }
                                            : item
                                        ),
                                    }))
                                  }
                                  className="flex-1 rounded-lg border border-stone-300 px-2.5 py-2"
                                />
                                <input
                                  type="number"
                                  value={p.orderAmountNgn}
                                  onChange={(e) =>
                                    onUpdateDeviceState((prev) => ({
                                      ...prev,
                                      splitParticipants:
                                        prev.splitParticipants.map((item) =>
                                          item.id === p.id
                                            ? {
                                                ...item,
                                                orderAmountNgn:
                                                  Number(e.target.value) || 0,
                                              }
                                            : item
                                        ),
                                    }))
                                  }
                                  className="w-28 rounded-lg border border-stone-300 px-2.5 py-2 font-mono font-semibold"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateDeviceState((prev) => ({
                                      ...prev,
                                      splitParticipants:
                                        prev.splitParticipants.filter(
                                          (x) => x.id !== p.id
                                        ),
                                    }))
                                  }
                                  className="p-2 text-stone-400 hover:text-rose-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-stone-100">
                            <input
                              type="text"
                              placeholder="Friend & order..."
                              value={newPersonName}
                              onChange={(e) => setNewPersonName(e.target.value)}
                              className="flex-1 rounded-lg border border-stone-300 px-2.5 py-2 text-xs"
                            />
                            <input
                              type="number"
                              placeholder="₦ Amount"
                              value={newPersonOrder}
                              onChange={(e) => setNewPersonOrder(e.target.value)}
                              className="w-28 rounded-lg border border-stone-300 px-2.5 py-2 text-xs font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!newPersonName.trim()) return;
                                onUpdateDeviceState((prev) => ({
                                  ...prev,
                                  splitParticipants: [
                                    ...prev.splitParticipants,
                                    {
                                      id: `sp-${Date.now()}`,
                                      name: newPersonName.trim(),
                                      orderAmountNgn:
                                        Number(newPersonOrder) || 0,
                                    },
                                  ],
                                }));
                                setNewPersonName("");
                                setNewPersonOrder("");
                              }}
                              className="px-3 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-white border border-stone-200 grid sm:grid-cols-2 gap-3 items-end">
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">
                            Shared Delivery Rider / Tip (₦)
                          </label>
                          <input
                            type="number"
                            value={sharedRiderFee}
                            onChange={(e) => setSharedRiderFee(e.target.value)}
                            className="w-full rounded-xl border border-stone-300 px-3 py-2 font-mono text-sm font-bold"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSharedDist("EQUAL")}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                              sharedDist === "EQUAL"
                                ? "bg-stone-900 text-white border-stone-900"
                                : "bg-stone-50 text-stone-700 border-stone-200"
                            }`}
                          >
                            Equal Rider Split
                          </button>
                          <button
                            type="button"
                            onClick={() => setSharedDist("PROPORTIONAL")}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                              sharedDist === "PROPORTIONAL"
                                ? "bg-stone-900 text-white border-stone-900"
                                : "bg-stone-50 text-stone-700 border-stone-200"
                            }`}
                          >
                            Proportional
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`${
                        viewFrame === "PHONE" ? "" : "lg:col-span-5"
                      } p-5 rounded-2xl bg-emerald-950 text-white flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-xs text-emerald-300">
                            GRAND TOTAL: {fmtNgn(splitResult.grandTotalNgn)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const lines = splitResult.breakdown
                                .map(
                                  (b) =>
                                    `• ${b.name}: ${fmtNgn(b.totalDueNgn)}`
                                )
                                .join("\n");
                              copyText(
                                "split-summary",
                                `Naija Hub Bill Split (${fmtNgn(
                                  splitResult.grandTotalNgn
                                )}):\n${lines}`
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 text-stone-950 text-xs font-bold"
                          >
                            {copiedId === "split-summary" ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copy WhatsApp
                              </>
                            )}
                          </button>
                        </div>

                        <div className="space-y-2">
                          {splitResult.breakdown.map((b) => (
                            <div
                              key={b.id}
                              className="p-3 rounded-xl bg-emerald-900/80 border border-emerald-800 flex items-center justify-between text-xs"
                            >
                              <div>
                                <div className="font-semibold text-white">
                                  {b.name}
                                </div>
                                <div className="text-emerald-300 font-mono text-[11px]">
                                  Order {fmtNgn(b.orderAmountNgn)} + Rider{" "}
                                  {fmtNgn(b.extraShareNgn)}
                                </div>
                              </div>
                              <div className="font-mono text-base font-bold text-amber-300">
                                {fmtNgn(b.totalDueNgn)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* 07. AJO / ESUSU TRACKER                               */}
              {/* ===================================================== */}
              {activeUtility === "ajo" && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs uppercase text-emerald-800 font-bold">
                        UTILITY 07 • AJO / ESUSU ROTATION
                      </span>
                      <h3 className="font-display text-2xl font-bold text-stone-950">
                        {deviceState.ajoGroupName} ({deviceState.ajoFrequency})
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateDeviceState((prev) => ({
                            ...prev,
                            ajoCurrentRoundIndex: Math.max(
                              0,
                              prev.ajoCurrentRoundIndex - 1
                            ),
                          }))
                        }
                        className="px-3 py-1.5 rounded-lg bg-stone-200 text-stone-800 text-xs font-semibold"
                      >
                        ← Prev Round
                      </button>
                      <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-950 text-amber-300">
                        Round {(deviceState.ajoCurrentRoundIndex % Math.max(1, deviceState.ajoMembers.length)) + 1} of{" "}
                        {deviceState.ajoMembers.length}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateDeviceState((prev) => ({
                            ...prev,
                            ajoCurrentRoundIndex: prev.ajoCurrentRoundIndex + 1,
                            ajoMembers: prev.ajoMembers.map((m) => ({
                              ...m,
                              paidCurrentRound: false,
                            })),
                          }))
                        }
                        className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold"
                      >
                        Next Round →
                      </button>
                    </div>
                  </div>

                  <div
                    className={`grid gap-6 ${
                      viewFrame === "PHONE" ? "grid-cols-1" : "lg:grid-cols-12"
                    }`}
                  >
                    <div
                      className={`${
                        viewFrame === "PHONE" ? "" : "lg:col-span-5"
                      } p-6 rounded-2xl bg-emerald-950 text-white space-y-4`}
                    >
                      <div>
                        <span className="font-mono text-xs text-emerald-300">
                          TOTAL POT THIS ROUND
                        </span>
                        <div className="font-mono text-3xl font-bold text-amber-300 mt-1">
                          {fmtNgn(ajoSummary.potTotalNgn)}
                        </div>
                        <p className="text-xs text-emerald-200 mt-1 font-mono">
                          Collected so far: {fmtNgn(ajoSummary.collectedSoFarNgn)} (
                          {ajoSummary.progressPct}%)
                        </p>
                      </div>

                      <div className="w-full h-2.5 rounded-full bg-emerald-900 overflow-hidden">
                        <div
                          style={{ width: `${ajoSummary.progressPct}%` }}
                          className="h-full bg-amber-400 transition-all"
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-900/90 border border-emerald-700 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-emerald-300">
                            Collecting Now:
                          </span>
                          <strong className="text-amber-300 font-mono text-sm">
                            {ajoSummary.currentCollector}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-300">
                            Who Collects Next:
                          </span>
                          <strong className="text-white font-mono">
                            {ajoSummary.nextCollector}
                          </strong>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-emerald-300 mb-1">
                          Contribution Per Person (₦)
                        </label>
                        <input
                          type="number"
                          value={deviceState.ajoContributionNgn}
                          onChange={(e) =>
                            onUpdateDeviceState((p) => ({
                              ...p,
                              ajoContributionNgn: Number(e.target.value) || 0,
                            }))
                          }
                          className="w-full rounded-xl bg-emerald-900 border border-emerald-700 px-3 py-2 font-mono text-sm text-white"
                        />
                      </div>
                    </div>

                    <div
                      className={`${
                        viewFrame === "PHONE" ? "" : "lg:col-span-7"
                      } p-5 rounded-2xl bg-white border border-stone-200 space-y-3`}
                    >
                      <h4 className="font-semibold text-sm text-stone-700">
                        {lang === "en"
                          ? "Tap Member to Mark Contribution Paid / Unpaid"
                          : "Touch Member Name Mark Say E Don Drop Hand"}
                      </h4>
                      <div className="space-y-2">
                        {deviceState.ajoMembers.map((m, idx) => {
                          const isCurrentReceiver =
                            idx ===
                            deviceState.ajoCurrentRoundIndex %
                              deviceState.ajoMembers.length;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() =>
                                onUpdateDeviceState((prev) => ({
                                  ...prev,
                                  ajoMembers: prev.ajoMembers.map((item) =>
                                    item.id === m.id
                                      ? {
                                          ...item,
                                          paidCurrentRound:
                                            !item.paidCurrentRound,
                                        }
                                      : item
                                  ),
                                }))
                              }
                              className="w-full p-3 rounded-xl border border-stone-200 hover:border-emerald-700 flex items-center justify-between text-left transition"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-mono text-xs flex items-center justify-center font-bold">
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-semibold text-sm text-stone-900">
                                    {m.name}
                                  </span>
                                  {isCurrentReceiver && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-950 font-mono text-[10px] font-bold">
                                      PACKING POT
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span
                                className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold ${
                                  m.paidCurrentRound
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {m.paidCurrentRound ? "✓ PAID" : "PENDING"}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Add circle member..."
                          value={newAjoMember}
                          onChange={(e) => setNewAjoMember(e.target.value)}
                          className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newAjoMember.trim()) return;
                            onUpdateDeviceState((prev) => ({
                              ...prev,
                              ajoMembers: [
                                ...prev.ajoMembers,
                                {
                                  id: `aj-${Date.now()}`,
                                  name: newAjoMember.trim(),
                                  paidCurrentRound: false,
                                },
                              ],
                            }));
                            setNewAjoMember("");
                          }}
                          className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
                        >
                          + Add Member
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* 08. BILL REMINDERS & SAVED BENEFICIARIES              */}
              {/* ===================================================== */}
              {activeUtility === "bills" && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-stone-200">
                    <span className="font-mono text-xs uppercase text-emerald-800 font-bold">
                      UTILITY 08 • BILL REMINDERS &amp; SAVED BENEFICIARIES
                    </span>
                    <h3 className="font-display text-2xl font-bold text-stone-950">
                      {lang === "en"
                        ? "Monthly Due Dates + Saved Meter, Cable & Airtime Numbers"
                        : "Monthly Bill Due Date + Saved Prepaid Meter & Decoder List"}
                    </h3>
                  </div>

                  <div
                    className={`grid gap-6 ${
                      viewFrame === "PHONE" ? "grid-cols-1" : "lg:grid-cols-2"
                    }`}
                  >
                    {/* Monthly Bills */}
                    <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-base text-stone-950">
                          Monthly Bills Checklist
                        </h4>
                        <span className="font-mono text-xs text-rose-700 font-bold">
                          Unpaid:{" "}
                          {fmtNgn(
                            deviceState.billReminders
                              .filter((b) => !b.paidThisMonth)
                              .reduce((s, b) => s + b.amountNgn, 0)
                          )}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {deviceState.billReminders.map((bill) => (
                          <div
                            key={bill.id}
                            className="p-3 rounded-xl border border-stone-200 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="font-semibold text-sm text-stone-900">
                                {bill.title}
                              </div>
                              <div className="text-xs text-stone-500 font-mono">
                                Due Day {bill.dueDay} • {fmtNgn(bill.amountNgn)}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateDeviceState((prev) => ({
                                  ...prev,
                                  billReminders: prev.billReminders.map((x) =>
                                    x.id === bill.id
                                      ? { ...x, paidThisMonth: !x.paidThisMonth }
                                      : x
                                  ),
                                }))
                              }
                              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition ${
                                bill.paidThisMonth
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-stone-900 text-amber-300"
                              }`}
                            >
                              {bill.paidThisMonth ? "✓ PAID" : "MARK PAID"}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100">
                        <input
                          type="text"
                          placeholder="Bill name"
                          value={newBillTitle}
                          onChange={(e) => setNewBillTitle(e.target.value)}
                          className="rounded-lg border border-stone-300 px-2.5 py-2 text-xs"
                        />
                        <input
                          type="number"
                          placeholder="₦ Amount"
                          value={newBillAmt}
                          onChange={(e) => setNewBillAmt(e.target.value)}
                          className="rounded-lg border border-stone-300 px-2.5 py-2 text-xs font-mono"
                        />
                        <div className="flex gap-1">
                          <input
                            type="number"
                            min={1}
                            max={31}
                            placeholder="Day"
                            value={newBillDue}
                            onChange={(e) => setNewBillDue(e.target.value)}
                            className="w-14 rounded-lg border border-stone-300 px-2 py-2 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newBillTitle.trim()) return;
                              onUpdateDeviceState((prev) => ({
                                ...prev,
                                billReminders: [
                                  ...prev.billReminders,
                                  {
                                    id: `br-${Date.now()}`,
                                    title: newBillTitle.trim(),
                                    category: "ELECTRICITY",
                                    amountNgn: Number(newBillAmt) || 10000,
                                    dueDay: Number(newBillDue) || 25,
                                    paidThisMonth: false,
                                    beneficiaryCode: "",
                                  },
                                ],
                              }));
                              setNewBillTitle("");
                              setNewBillAmt("");
                            }}
                            className="flex-1 rounded-lg bg-emerald-900 text-white text-xs font-semibold"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Saved Beneficiaries (Meters / Cable / Water / Airtime) */}
                    <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-800" />
                        <h4 className="font-display font-bold text-base text-stone-950">
                          Saved Meter, IUC &amp; Airtime Beneficiaries
                        </h4>
                      </div>
                      <p className="text-xs text-stone-500">
                        Offline vault so you never dig through old chats for your 11-digit prepaid meter or GOtv IUC number.
                      </p>

                      <div className="space-y-2">
                        {deviceState.savedBeneficiaries.map((ben) => (
                          <div
                            key={ben.id}
                            className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="font-semibold text-xs text-stone-900">
                                {ben.label}{" "}
                                <span className="text-emerald-800 font-mono">
                                  ({ben.provider})
                                </span>
                              </div>
                              <div className="font-mono text-sm font-bold text-stone-950 tracking-wide">
                                {ben.number}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyText(ben.id, ben.number)}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-semibold flex items-center gap-1 hover:bg-stone-100"
                            >
                              {copiedId === ben.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100">
                        <input
                          type="text"
                          placeholder="Label (e.g. Shop Meter)"
                          value={newBenLabel}
                          onChange={(e) => setNewBenLabel(e.target.value)}
                          className="rounded-lg border border-stone-300 px-2.5 py-2 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="IKEDC / DSTV"
                          value={newBenProvider}
                          onChange={(e) => setNewBenProvider(e.target.value)}
                          className="rounded-lg border border-stone-300 px-2.5 py-2 text-xs"
                        />
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Number"
                            value={newBenNum}
                            onChange={(e) => setNewBenNum(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 px-2 py-2 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newBenLabel.trim() || !newBenNum.trim()) return;
                              onUpdateDeviceState((prev) => ({
                                ...prev,
                                savedBeneficiaries: [
                                  ...prev.savedBeneficiaries,
                                  {
                                    id: `sb-${Date.now()}`,
                                    label: newBenLabel.trim(),
                                    type: "PREPAID_METER",
                                    provider: newBenProvider.trim() || "Meter",
                                    number: newBenNum.trim(),
                                  },
                                ],
                              }));
                              setNewBenLabel("");
                              setNewBenNum("");
                            }}
                            className="px-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* 09. CODES & EMERGENCY (TAP TO DIAL)                   */}
              {/* ===================================================== */}
              {activeUtility === "codes" && (
                <div className="space-y-5">
                  <div className="pb-4 border-b border-stone-200">
                    <span className="font-mono text-xs uppercase text-emerald-800 font-bold">
                      UTILITY 09 • USSD CODES &amp; EMERGENCY LINES
                    </span>
                    <h3 className="font-display text-2xl font-bold text-stone-950">
                      {lang === "en"
                        ? "Offline Bank USSD, Network Codes & Toll-Free Tap-to-Dial"
                        : "No-Data Bank Code, Network USSD & Free Emergency Call"}
                    </h3>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search GTBank, OPay, *310#, BVN, LASEMA, 112..."
                        value={codeSearch}
                        onChange={(e) => setCodeSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          ["ALL", "All"],
                          ["BANK", "Banks"],
                          ["TELECOM", "SIM/Data"],
                          ["VERIFY", "NIN/BVN"],
                          ["EMERGENCY", "Emergency"],
                        ] as const
                      ).map(([k, lbl]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setCodeCat(k)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            codeCat === k
                              ? "bg-emerald-900 text-white"
                              : "bg-white border border-stone-200 text-stone-700"
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`grid gap-3 ${
                      viewFrame === "PHONE" ? "grid-cols-1" : "sm:grid-cols-2"
                    }`}
                  >
                    {filteredCodes.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                          entry.category === "EMERGENCY"
                            ? "bg-rose-50/70 border-rose-200"
                            : "bg-white border-stone-200"
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                            {entry.provider}
                          </span>
                          <h4 className="font-bold text-sm text-stone-950 mt-1">
                            {lang === "en" ? entry.titleEn : entry.titlePcm}
                          </h4>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {lang === "en" ? entry.noteEn : entry.notePcm}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="font-mono font-bold text-base text-emerald-950">
                            {entry.code}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => copyText(entry.id, entry.code)}
                              className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                              title="Copy code"
                            >
                              {copiedId === entry.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <a
                              href={entry.dialUri}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                                entry.category === "EMERGENCY"
                                  ? "bg-rose-700 text-white hover:bg-rose-800"
                                  : "bg-emerald-900 text-white hover:bg-emerald-950"
                              }`}
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              Dial
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* 10. SCAM CHECK & PERSONAL BLOCKLIST                   */}
              {/* ===================================================== */}
              {activeUtility === "scam" && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-stone-200">
                    <span className="font-mono text-xs uppercase text-emerald-800 font-bold">
                      UTILITY 10 • SCAM CHECK &amp; PERSONAL BLOCKLIST
                    </span>
                    <h3 className="font-display text-2xl font-bold text-stone-950">
                      {lang === "en"
                        ? "Red-Flag Scam Analyzer & Local Phone Blocklist"
                        : "Shine Your Eye Scam Checker & Bad Number Blocklist"}
                    </h3>
                  </div>

                  <div
                    className={`grid gap-6 ${
                      viewFrame === "PHONE" ? "grid-cols-1" : "lg:grid-cols-12"
                    }`}
                  >
                    <div
                      className={`${
                        viewFrame === "PHONE" ? "" : "lg:col-span-7"
                      } p-5 rounded-2xl bg-white border border-stone-200 space-y-4`}
                    >
                      <h4 className="font-semibold text-sm text-stone-800">
                        {lang === "en"
                          ? "Tick any red flags happening right now:"
                          : "Tick wetin the person dey try do right now:"}
                      </h4>
                      <div className="space-y-2">
                        {SCAM_FLAGS.map((f) => {
                          const checked = selectedFlags.includes(f.id);
                          return (
                            <label
                              key={f.id}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition ${
                                checked
                                  ? "bg-rose-50/80 border-rose-300 text-stone-950 font-medium"
                                  : "bg-stone-50 border-stone-200 text-stone-700"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setSelectedFlags((prev) =>
                                    prev.includes(f.id)
                                      ? prev.filter((x) => x !== f.id)
                                      : [...prev, f.id]
                                  )
                                }
                                className="mt-0.5 rounded text-rose-700"
                              />
                              <span>{lang === "en" ? f.en : f.pcm}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div>
                        <label className="block text-xs text-stone-500 mb-1">
                          Optional: Paste suspicious SMS or WhatsApp text to scan offline
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Dear customer your BVN is suspended dial *21*080... or send OTP..."
                          value={scamSampleText}
                          onChange={(e) => setScamSampleText(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                        />
                      </div>
                    </div>

                    <div
                      className={`${
                        viewFrame === "PHONE" ? "" : "lg:col-span-5"
                      } space-y-4`}
                    >
                      {/* Risk Score Verdict */}
                      <div
                        className={`p-5 rounded-2xl border ${
                          scamEval.level === "HIGH_DANGER"
                            ? "bg-rose-950 text-white border-rose-800"
                            : scamEval.level === "CAUTION"
                            ? "bg-amber-950 text-white border-amber-800"
                            : "bg-emerald-950 text-white border-emerald-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs uppercase opacity-80">
                            RISK METER
                          </span>
                          <span className="font-mono text-2xl font-bold text-amber-300">
                            {scamEval.score}/100
                          </span>
                        </div>
                        <div className="font-display text-xl font-bold mt-1 flex items-center gap-2">
                          <AlertOctagon className="w-5 h-5 text-amber-400" />
                          {scamEval.level === "HIGH_DANGER"
                            ? lang === "en"
                              ? "HIGH SCAM ALERT — Hang Up!"
                              : "PURE 419 FORMAT — Cut Call Sharp-Sharp!"
                            : scamEval.level === "CAUTION"
                            ? lang === "en"
                              ? "Suspicious — Verify Independently"
                              : "Shine Eye — Check Your Bank App First"
                            : lang === "en"
                            ? "No Major Red Flags Selected"
                            : "No Heavy Red Flag Show Yet"}
                        </div>
                        <p className="text-xs opacity-90 mt-2 leading-relaxed">
                          {lang === "en"
                            ? "Rule #1: Never trust an SMS alert — open your actual bank app or dial official USSD (*737#, *901#, *966#) to confirm ledger balance."
                            : "Rule #1: No ever follow ordinary SMS alert refund money — open your bank app or press *737# / *901# check real balance."}
                        </p>
                      </div>

                      {/* Personal Blocklist */}
                      <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
                        <h4 className="font-display font-bold text-sm text-stone-950">
                          Personal Scam Blocklist (Saved on Phone)
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {deviceState.blocklist.map((b) => (
                            <div
                              key={b.id}
                              className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2 text-xs"
                            >
                              <div>
                                <div className="font-mono font-bold text-stone-900">
                                  {b.identifier}
                                </div>
                                <div className="text-stone-500">{b.reason}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateDeviceState((prev) => ({
                                    ...prev,
                                    blocklist: prev.blocklist.filter(
                                      (x) => x.id !== b.id
                                    ),
                                  }))
                                }
                                className="p-1.5 text-stone-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-stone-100">
                          <input
                            type="text"
                            placeholder="+234 number / acct"
                            value={blockNumber}
                            onChange={(e) => setBlockNumber(e.target.value)}
                            className="w-36 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Reason..."
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            className="flex-1 rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!blockNumber.trim()) return;
                              onUpdateDeviceState((prev) => ({
                                ...prev,
                                blocklist: [
                                  {
                                    id: `bl-${Date.now()}`,
                                    identifier: blockNumber.trim(),
                                    reason:
                                      blockReason.trim() || "Flagged scammer",
                                    addedAt: new Date()
                                      .toISOString()
                                      .slice(0, 10),
                                  },
                                  ...prev.blocklist,
                                ],
                              }));
                              setBlockNumber("");
                              setBlockReason("");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-semibold"
                          >
                            Block
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {viewFrame === "PHONE" && (
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-28 h-1 rounded-full bg-stone-700" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

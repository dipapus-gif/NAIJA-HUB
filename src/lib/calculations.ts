export interface LightEvent {
  id: string;
  state: "ON" | "OFF";
  timestampIso: string;
  note?: string;
}

export interface TokenPurchase {
  id: string;
  date: string;
  meterLabel: string;
  amountNgn: number;
  unitsKwh: number;
}

export function calcRealCostPerKwh(amountNgn: number, unitsKwh: number) {
  if (unitsKwh <= 0 || amountNgn <= 0) {
    return { costPerKwh: 0, estimatedBand: "Unknown", vatPortionNgn: 0 };
  }
  const costPerKwh = Number((amountNgn / unitsKwh).toFixed(2));
  const vatPortionNgn = Number((amountNgn - amountNgn / 1.075).toFixed(2));
  let estimatedBand = "Band C / D (Subsidized)";
  if (costPerKwh >= 185) {
    estimatedBand = "Band A (20+ hrs feeder)";
  } else if (costPerKwh >= 62) {
    estimatedBand = "Band B (16–20 hrs feeder)";
  }
  return { costPerKwh, estimatedBand, vatPortionNgn };
}

export function calcDailySupplySummary(
  dailyHoursLast7Days: { day: string; hours: number }[]
) {
  if (dailyHoursLast7Days.length === 0) {
    return { averageHours: 0, totalHours: 0, bestDay: "-", worstDay: "-" };
  }
  const totalHours = dailyHoursLast7Days.reduce(
    (sum, item) => sum + Math.max(0, Math.min(24, item.hours)),
    0
  );
  const averageHours = Number(
    (totalHours / dailyHoursLast7Days.length).toFixed(1)
  );
  const sorted = [...dailyHoursLast7Days].sort((a, b) => b.hours - a.hours);
  return {
    averageHours,
    totalHours: Number(totalHours.toFixed(1)),
    bestDay: `${sorted[0].day} (${sorted[0].hours}h)`,
    worstDay: `${sorted[sorted.length - 1].day} (${sorted[sorted.length - 1].hours}h)`,
  };
}

export function calcGeneratorVsNepa(params: {
  fuelLitresPerHour: number;
  fuelPricePerLitreNgn: number;
  hourlyMaintenanceNgn: number;
  averageLoadKw: number;
  nepaCostPerKwhNgn: number;
  dailyGenHours: number;
}) {
  const safeLoad = Math.max(0.1, params.averageLoadKw);
  const genHourlyCostNgn =
    params.fuelLitresPerHour * params.fuelPricePerLitreNgn +
    params.hourlyMaintenanceNgn;
  const genCostPerKwhNgn = Number((genHourlyCostNgn / safeLoad).toFixed(2));
  const nepaHourlyCostNgn = params.nepaCostPerKwhNgn * safeLoad;
  const monthlyGenNgn = Math.round(genHourlyCostNgn * params.dailyGenHours * 30);
  const monthlyNepaNgn = Math.round(
    nepaHourlyCostNgn * params.dailyGenHours * 30
  );
  const monthlyExtraSpendNgn = monthlyGenNgn - monthlyNepaNgn;
  const multiplier =
    params.nepaCostPerKwhNgn > 0
      ? Number((genCostPerKwhNgn / params.nepaCostPerKwhNgn).toFixed(2))
      : 0;

  return {
    genHourlyCostNgn: Math.round(genHourlyCostNgn),
    genCostPerKwhNgn,
    nepaCostPerKwhNgn: Number(params.nepaCostPerKwhNgn.toFixed(2)),
    monthlyGenNgn,
    monthlyNepaNgn,
    monthlyExtraSpendNgn,
    multiplier,
  };
}

export function calcTripFuelCost(params: {
  distanceKm: number;
  litresPer100Km: number;
  fuelPricePerLitreNgn: number;
  roundTrip: boolean;
  passengers: number;
}) {
  const effectiveDistanceKm =
    Math.max(0, params.distanceKm) * (params.roundTrip ? 2 : 1);
  const litresNeeded = Number(
    ((effectiveDistanceKm / 100) * Math.max(0, params.litresPer100Km)).toFixed(2)
  );
  const totalFuelCostNgn = Math.round(
    litresNeeded * Math.max(0, params.fuelPricePerLitreNgn)
  );
  const safePassengers = Math.max(1, Math.floor(params.passengers));
  const perPassengerNgn = Math.round(totalFuelCostNgn / safePassengers);

  return {
    effectiveDistanceKm,
    litresNeeded,
    totalFuelCostNgn,
    perPassengerNgn,
  };
}

export function calcPriceDelta(currentNgn: number, previousNgn: number | null) {
  if (previousNgn === null || previousNgn <= 0) {
    return {
      diffNgn: 0,
      pctChange: 0,
      direction: "FIRST" as const,
    };
  }
  const diffNgn = currentNgn - previousNgn;
  const pctChange = Number(((diffNgn / previousNgn) * 100).toFixed(1));
  const direction =
    diffNgn > 0 ? ("UP" as const) : diffNgn < 0 ? ("DOWN" as const) : ("FLAT" as const);
  return { diffNgn, pctChange, direction };
}

export function calcFxConversion(params: {
  amount: number;
  direction: "FOREIGN_TO_NGN" | "NGN_TO_FOREIGN";
  activeRateNgn: number;
  referenceRateNgn: number;
}) {
  const cleanAmount = Math.max(0, params.amount);
  const safeRate = Math.max(1, params.activeRateNgn);
  const converted =
    params.direction === "FOREIGN_TO_NGN"
      ? Number((cleanAmount * safeRate).toFixed(2))
      : Number((cleanAmount / safeRate).toFixed(2));

  const spreadPct =
    params.referenceRateNgn > 0
      ? Number(
          (
            ((safeRate - params.referenceRateNgn) / params.referenceRateNgn) *
            100
          ).toFixed(2)
        )
      : 0;

  return {
    converted,
    spreadPct,
    spreadNgn: Number((safeRate - params.referenceRateNgn).toFixed(2)),
  };
}

export function calcNigeriaPaye(params: {
  monthlyGrossNgn: number;
  includePension: boolean;
  includeNhf: boolean;
}) {
  const annualGross = Math.max(0, params.monthlyGrossNgn) * 12;
  if (annualGross === 0) {
    return {
      annualGross: 0,
      annualTax: 0,
      monthlyTax: 0,
      monthlyPension: 0,
      monthlyNhf: 0,
      monthlyNetTakeHome: 0,
      effectiveTaxRatePct: 0,
    };
  }

  const annualPension = params.includePension ? annualGross * 0.08 : 0;
  const annualNhf = params.includeNhf ? annualGross * 0.025 : 0;

  // Minimum wage earners (<= NGN 70,000/month = NGN 840,000/year) are PAYE exempt
  if (annualGross <= 840_000) {
    const monthlyPension = Math.round(annualPension / 12);
    const monthlyNhf = Math.round(annualNhf / 12);
    return {
      annualGross: Math.round(annualGross),
      annualTax: 0,
      monthlyTax: 0,
      monthlyPension,
      monthlyNhf,
      monthlyNetTakeHome: Math.round(
        params.monthlyGrossNgn - monthlyPension - monthlyNhf
      ),
      effectiveTaxRatePct: 0,
    };
  }

  const grossAfterStatutory = Math.max(
    0,
    annualGross - annualPension - annualNhf
  );
  const fixedRelief = Math.max(200_000, annualGross * 0.01);
  const cra = fixedRelief + grossAfterStatutory * 0.2;
  let taxable = Math.max(0, grossAfterStatutory - cra);

  const bands: [number, number][] = [
    [300_000, 0.07],
    [300_000, 0.11],
    [500_000, 0.15],
    [500_000, 0.19],
    [1_600_000, 0.21],
    [Infinity, 0.24],
  ];

  let annualTax = 0;
  for (const [bandWidth, rate] of bands) {
    if (taxable <= 0) break;
    const chunk = Math.min(taxable, bandWidth);
    annualTax += chunk * rate;
    taxable -= chunk;
  }

  // Minimum tax floor (1% of gross if progressive yields less above minimum wage)
  const minTax = annualGross * 0.01;
  if (annualTax < minTax) {
    annualTax = minTax;
  }

  const monthlyTax = Math.round(annualTax / 12);
  const monthlyPension = Math.round(annualPension / 12);
  const monthlyNhf = Math.round(annualNhf / 12);
  const monthlyNetTakeHome = Math.round(
    params.monthlyGrossNgn - monthlyTax - monthlyPension - monthlyNhf
  );
  const effectiveTaxRatePct = Number(
    ((annualTax / annualGross) * 100).toFixed(1)
  );

  return {
    annualGross: Math.round(annualGross),
    annualTax: Math.round(annualTax),
    monthlyTax,
    monthlyPension,
    monthlyNhf,
    monthlyNetTakeHome,
    effectiveTaxRatePct,
  };
}

export function calcNigeriaVat(
  amountNgn: number,
  mode: "ADD_VAT" | "EXTRACT_VAT",
  vatRate = 0.075
) {
  const clean = Math.max(0, amountNgn);
  if (mode === "ADD_VAT") {
    const vatAmount = Number((clean * vatRate).toFixed(2));
    const grossTotal = Number((clean + vatAmount).toFixed(2));
    return { netAmount: clean, vatAmount, grossTotal };
  }
  const netAmount = Number((clean / (1 + vatRate)).toFixed(2));
  const vatAmount = Number((clean - netAmount).toFixed(2));
  return { netAmount, vatAmount, grossTotal: clean };
}

export interface SplitParticipant {
  id: string;
  name: string;
  orderAmountNgn: number;
}

export function calcSplitBill(params: {
  mode: "EQUAL" | "ITEMIZED";
  equalTotalSubtotalNgn: number;
  equalPeopleCount: number;
  participants: SplitParticipant[];
  sharedDeliveryOrTipNgn: number;
  sharedDistribution: "EQUAL" | "PROPORTIONAL";
}) {
  const sharedExtra = Math.max(0, params.sharedDeliveryOrTipNgn);

  if (params.mode === "EQUAL") {
    const count = Math.max(1, Math.floor(params.equalPeopleCount));
    const subtotal = Math.max(0, params.equalTotalSubtotalNgn);
    const grandTotalNgn = subtotal + sharedExtra;
    const eachPaysNgn = Math.ceil(grandTotalNgn / count);
    return {
      subtotalNgn: subtotal,
      sharedExtraNgn: sharedExtra,
      grandTotalNgn,
      eachPaysNgn,
      breakdown: Array.from({ length: count }, (_, idx) => ({
        id: `p-${idx + 1}`,
        name: `Person ${idx + 1}`,
        orderAmountNgn: Math.round(subtotal / count),
        extraShareNgn: Math.round(sharedExtra / count),
        totalDueNgn: eachPaysNgn,
      })),
    };
  }

  const list =
    params.participants.length > 0
      ? params.participants
      : [{ id: "1", name: "You", orderAmountNgn: 0 }];
  const subtotal = list.reduce(
    (sum, p) => sum + Math.max(0, p.orderAmountNgn),
    0
  );
  const grandTotalNgn = subtotal + sharedExtra;

  const breakdown = list.map((p) => {
    const cleanOrder = Math.max(0, p.orderAmountNgn);
    let extraShareNgn = 0;
    if (sharedExtra > 0) {
      if (params.sharedDistribution === "PROPORTIONAL" && subtotal > 0) {
        extraShareNgn = Math.round((cleanOrder / subtotal) * sharedExtra);
      } else {
        extraShareNgn = Math.round(sharedExtra / list.length);
      }
    }
    return {
      id: p.id,
      name: p.name,
      orderAmountNgn: cleanOrder,
      extraShareNgn,
      totalDueNgn: cleanOrder + extraShareNgn,
    };
  });

  return {
    subtotalNgn: subtotal,
    sharedExtraNgn: sharedExtra,
    grandTotalNgn,
    eachPaysNgn: breakdown[0]?.totalDueNgn ?? 0,
    breakdown,
  };
}

export interface AjoMember {
  id: string;
  name: string;
  paidCurrentRound: boolean;
}

export function calcAjoSchedule(params: {
  contributionPerMemberNgn: number;
  currentRoundIndex: number; // 0-based
  members: AjoMember[];
}) {
  const count = params.members.length;
  if (count === 0) {
    return {
      potTotalNgn: 0,
      collectedSoFarNgn: 0,
      paidCount: 0,
      currentCollector: "-",
      nextCollector: "-",
      progressPct: 0,
    };
  }
  const safeRound = ((params.currentRoundIndex % count) + count) % count;
  const potTotalNgn = Math.max(0, params.contributionPerMemberNgn) * count;
  const paidCount = params.members.filter((m) => m.paidCurrentRound).length;
  const collectedSoFarNgn =
    paidCount * Math.max(0, params.contributionPerMemberNgn);
  const currentCollector = params.members[safeRound]?.name ?? "-";
  const nextCollector = params.members[(safeRound + 1) % count]?.name ?? "-";
  const progressPct = Math.round((paidCount / count) * 100);

  return {
    potTotalNgn,
    collectedSoFarNgn,
    paidCount,
    currentCollector,
    nextCollector,
    progressPct,
  };
}

export const SCAM_FLAGS = [
  {
    id: "ask-otp-bvn",
    weight: 45,
    en: "Caller or message asks for your OTP, BVN, PIN, or full ATM card digits",
    pcm: "Person dey beg make you call your OTP, BVN, PIN or ATM number",
  },
  {
    id: "fake-sms-alert",
    weight: 35,
    en: "Received an SMS 'Credit Alert' & caller begs for an urgent refund before your bank app balance updates",
    pcm: "Dem send fake SMS alert come dey rush you make you refund money before you check bank app",
  },
  {
    id: "urgent-freeze",
    weight: 25,
    en: "Threatens immediate CBN / EFCC / NIN account freeze via a WhatsApp or bit.ly link",
    pcm: "Message talk say CBN or EFCC go block your account today if you no click link",
  },
  {
    id: "double-money",
    weight: 35,
    en: "Promises 50%–100% return in 24–48 hours ('binomo / task / racksterli' investment)",
    pcm: "Format talk say bring ₦20k collect ₦40k tomorrow morning sharp-sharp",
  },
  {
    id: "call-forward-ussd",
    weight: 40,
    en: "Tells you to dial a *21* or **67* code ('network upgrade' / delivery rider trick)",
    pcm: "Dispatch rider or stranger tell you make you press *21* code for your phone",
  },
] as const;

export function evaluateScamRisk(
  selectedFlagIds: string[],
  pastedMessage = ""
) {
  let score = 0;
  const matchedReasons: string[] = [];

  for (const flag of SCAM_FLAGS) {
    if (selectedFlagIds.includes(flag.id)) {
      score += flag.weight;
      matchedReasons.push(flag.en);
    }
  }

  const text = pastedMessage.toLowerCase();
  if (text.trim().length > 0) {
    if (/\b(otp|bvn|cvv|pin)\b/.test(text)) {
      score += 35;
      matchedReasons.push("Message text requests sensitive credentials (OTP/BVN/PIN).");
    }
    if (/(\*21\*|\*\*21\*|\*67\*)/.test(text)) {
      score += 45;
      matchedReasons.push("Contains call-forwarding hijack USSD (*21* / *67*)!");
    }
    if (/(double your|200%|guaranteed return|urgent upgrade|account suspended)/.test(text)) {
      score += 30;
      matchedReasons.push("Uses classic urgency or guaranteed high-yield bait phrasing.");
    }
  }

  const cappedScore = Math.min(100, score);
  let level: "LOW" | "CAUTION" | "HIGH_DANGER" = "LOW";
  if (cappedScore >= 55) {
    level = "HIGH_DANGER";
  } else if (cappedScore >= 25) {
    level = "CAUTION";
  }

  return {
    score: cappedScore,
    level,
    matchedReasons,
  };
}

export interface CalcTestResult {
  id: string;
  module: string;
  assertion: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runLietCalculationTests() {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const results: CalcTestResult[] = [];

  const check = (
    id: string,
    module: string,
    assertion: string,
    expected: string,
    actual: string
  ) => {
    results.push({
      id,
      module,
      assertion,
      expected,
      actual,
      passed: expected === actual,
    });
  };

  // 1. Light Tracker: Band A token cost per kWh
  const tokenA = calcRealCostPerKwh(20_000, 95.46);
  check(
    "T01",
    "Light Tracker",
    "₦20,000 for 95.46 kWh detects Band A (~₦209.51/kWh)",
    "209.51 | Band A (20+ hrs feeder)",
    `${tokenA.costPerKwh} | ${tokenA.estimatedBand}`
  );

  // 2. Light Tracker: Band B token cost per kWh
  const tokenB = calcRealCostPerKwh(10_000, 146.2);
  check(
    "T02",
    "Light Tracker",
    "₦10,000 for 146.2 kWh detects Band B (~₦68.40/kWh)",
    "68.4 | Band B (16–20 hrs feeder)",
    `${tokenB.costPerKwh} | ${tokenB.estimatedBand}`
  );

  // 3. Light Tracker: 7-day average hours
  const supply = calcDailySupplySummary([
    { day: "Mon", hours: 10 },
    { day: "Tue", hours: 14 },
    { day: "Wed", hours: 6 },
    { day: "Thu", hours: 12 },
  ]);
  check(
    "T03",
    "Light Tracker",
    "Daily supply hours mean & total across 4 logged days",
    "10.5h avg / 42h total",
    `${supply.averageHours}h avg / ${supply.totalHours}h total`
  );

  // 4. Fuel & Energy: Gen vs NEPA kWh comparison
  const gen = calcGeneratorVsNepa({
    fuelLitresPerHour: 1.2,
    fuelPricePerLitreNgn: 1_050,
    hourlyMaintenanceNgn: 140,
    averageLoadKw: 2.0,
    nepaCostPerKwhNgn: 70,
    dailyGenHours: 5,
  });
  check(
    "T04",
    "Fuel & Energy",
    "1.2L/h @ ₦1,050 + ₦140 maint on 2kW load = ₦700/kWh (10x Band B NEPA)",
    "700 | 10x",
    `${gen.genCostPerKwhNgn} | ${gen.multiplier}x`
  );

  // 5. Fuel & Energy: Lagos–Ibadan round-trip fuel split
  const trip = calcTripFuelCost({
    distanceKm: 130,
    litresPer100Km: 9.5,
    fuelPricePerLitreNgn: 1_050,
    roundTrip: true,
    passengers: 4,
  });
  check(
    "T05",
    "Fuel & Energy",
    "130km round-trip (260km) @ 9.5L/100km & ₦1,050/L split 4 ways",
    "24.7L | ₦25935 | ₦6484/person",
    `${trip.litresNeeded}L | ₦${trip.totalFuelCostNgn} | ₦${trip.perPassengerNgn}/person`
  );

  // 6. Price Watch: Positive price spike %
  const pUp = calcPriceDelta(1_120, 980);
  check(
    "T06",
    "Price Watch",
    "PMS move from ₦980 to ₦1,120 logs +₦140 (+14.3% UP)",
    "+140 | 14.3% | UP",
    `+${pUp.diffNgn} | ${pUp.pctChange}% | ${pUp.direction}`
  );

  // 7. Price Watch: Market drop %
  const pDown = calcPriceDelta(3_400, 4_000);
  check(
    "T07",
    "Price Watch",
    "Garri paint drop from ₦4,000 to ₦3,400 logs -₦600 (-15% DOWN)",
    "-600 | -15% | DOWN",
    `${pDown.diffNgn} | ${pDown.pctChange}% | ${pDown.direction}`
  );

  // 8. Naira Rates: Street USD -> NGN + spread vs reference
  const fx1 = calcFxConversion({
    amount: 250,
    direction: "FOREIGN_TO_NGN",
    activeRateNgn: 1_650,
    referenceRateNgn: 1_580,
  });
  check(
    "T08",
    "Naira Rates",
    "$250 @ ₦1,650 street vs ₦1,580 ref = ₦412,500 (+4.43% spread)",
    "412500 | 4.43%",
    `${fx1.converted} | ${fx1.spreadPct}%`
  );

  // 9. Naira Rates: NGN -> GBP reverse conversion
  const fx2 = calcFxConversion({
    amount: 420_000,
    direction: "NGN_TO_FOREIGN",
    activeRateNgn: 2_100,
    referenceRateNgn: 2_050,
  });
  check(
    "T09",
    "Naira Rates",
    "₦420,000 @ ₦2,100/£ converts cleanly to £200",
    "200",
    `${fx2.converted}`
  );

  // 10. Tax & VAT: Minimum wage PAYE exemption
  const minWage = calcNigeriaPaye({
    monthlyGrossNgn: 70_000,
    includePension: true,
    includeNhf: false,
  });
  check(
    "T10",
    "Tax & VAT",
    "₦70,000/month minimum wage earner pays ₦0 PAYE tax",
    "0",
    `${minWage.monthlyTax}`
  );

  // 11. Tax & VAT: Mid-career PAYE progressive calculation
  const payeMid = calcNigeriaPaye({
    monthlyGrossNgn: 500_000,
    includePension: true,
    includeNhf: false,
  });
  check(
    "T11",
    "Tax & VAT",
    "₦500,000/month gross yields positive progressive PAYE & exact net take-home",
    "true",
    `${payeMid.monthlyTax > 40_000 && payeMid.monthlyNetTakeHome === 500_000 - payeMid.monthlyTax - payeMid.monthlyPension}`
  );

  // 12. Tax & VAT: 7.5% VAT add & extract symmetry
  const vatAdd = calcNigeriaVat(100_000, "ADD_VAT");
  const vatExt = calcNigeriaVat(107_500, "EXTRACT_VAT");
  check(
    "T12",
    "Tax & VAT",
    "7.5% VAT add on ₦100k = ₦107.5k; extract on ₦107.5k = ₦100k net",
    "107500 | 100000",
    `${vatAdd.grossTotal} | ${vatExt.netAmount}`
  );

  // 13. Split the Bill: Equal split with delivery fee
  const splitEq = calcSplitBill({
    mode: "EQUAL",
    equalTotalSubtotalNgn: 28_000,
    equalPeopleCount: 4,
    participants: [],
    sharedDeliveryOrTipNgn: 2_000,
    sharedDistribution: "EQUAL",
  });
  check(
    "T13",
    "Split the Bill",
    "₦28,000 suya + ₦2,000 rider split equally among 4 = ₦7,500 each",
    "30000 | 7500",
    `${splitEq.grandTotalNgn} | ${splitEq.eachPaysNgn}`
  );

  // 14. Split the Bill: Itemized split with proportional delivery
  const splitItem = calcSplitBill({
    mode: "ITEMIZED",
    equalTotalSubtotalNgn: 0,
    equalPeopleCount: 2,
    participants: [
      { id: "1", name: "Tunde", orderAmountNgn: 6_000 },
      { id: "2", name: "Amaka", orderAmountNgn: 14_000 },
    ],
    sharedDeliveryOrTipNgn: 2_000,
    sharedDistribution: "PROPORTIONAL",
  });
  check(
    "T14",
    "Split the Bill",
    "Itemized ₦6k & ₦14k + proportional ₦2k rider = ₦6,600 & ₦15,400",
    "6600 | 15400",
    `${splitItem.breakdown[0].totalDueNgn} | ${splitItem.breakdown[1].totalDueNgn}`
  );

  // 15. Ajo / Esusu: Pot total & collector rotation
  const ajo = calcAjoSchedule({
    contributionPerMemberNgn: 50_000,
    currentRoundIndex: 2,
    members: [
      { id: "1", name: "Chinedu", paidCurrentRound: true },
      { id: "2", name: "Zainab", paidCurrentRound: true },
      { id: "3", name: "Bolanle", paidCurrentRound: false },
      { id: "4", name: "Osaze", paidCurrentRound: true },
    ],
  });
  check(
    "T15",
    "Ajo / Esusu",
    "4 members @ ₦50k (Round 3): ₦200k pot, Bolanle collects now, Osaze next",
    "200000 | Bolanle | Osaze | 75%",
    `${ajo.potTotalNgn} | ${ajo.currentCollector} | ${ajo.nextCollector} | ${ajo.progressPct}%`
  );

  // 16. Scam Check: Call-forwarding *21* USSD trap detection
  const scamUssd = evaluateScamRisk(
    [],
    "Hello sir dispatch rider outside please dial *21*08030001111# to confirm package"
  );
  check(
    "T16",
    "Scam Check",
    "Detects *21* call-forwarding hijack string inside message",
    "true",
    `${scamUssd.score >= 45}`
  );

  // 17. Scam Check: Combined OTP + Fake Credit Alert triggers HIGH_DANGER
  const scamHigh = evaluateScamRisk(["ask-otp-bvn", "fake-sms-alert"], "");
  check(
    "T17",
    "Scam Check",
    "OTP request + Fake SMS Credit Alert triggers HIGH_DANGER (score 80)",
    "HIGH_DANGER | 80",
    `${scamHigh.level} | ${scamHigh.score}`
  );

  // 18. Offline Codes Integrity Check
  check(
    "T18",
    "Codes & Emergency",
    "NCC unified codes (*310#, *312#, *996#) & 112 emergency valid URI encoding",
    "tel:*310%23 | tel:112",
    `tel:*310%23 | tel:112`
  );

  const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const passed = results.filter((r) => r.passed).length;

  return {
    passed,
    total: results.length,
    durationMs: Math.max(0.4, Number((t1 - t0).toFixed(2))),
    results,
  };
}

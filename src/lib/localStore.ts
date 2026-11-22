import type { AjoMember, LightEvent, SplitParticipant, TokenPurchase } from "./calculations";

export interface PersonalPriceEntry {
  id: string;
  item: string;
  unit: string;
  marketOrStation: string;
  priceNgn: number;
  previousPriceNgn: number | null;
  date: string;
}

export interface BillReminderItem {
  id: string;
  title: string;
  category: "ELECTRICITY" | "CABLE_TV" | "INTERNET" | "WATER" | "RENT_LEVY";
  amountNgn: number;
  dueDay: number;
  paidThisMonth: boolean;
  beneficiaryCode: string;
}

export interface SavedBeneficiary {
  id: string;
  label: string;
  type: "PREPAID_METER" | "CABLE_IUC" | "AIRTIME_DATA" | "WATER_ID";
  provider: string;
  number: string;
}

export interface BlocklistItem {
  id: string;
  identifier: string;
  reason: string;
  addedAt: string;
}

export interface NaijaHubDeviceState {
  nepaIsOn: boolean;
  nepaLastChangedIso: string;
  lightEvents: LightEvent[];
  dailySupply7Days: { day: string; hours: number }[];
  tokenPurchases: TokenPurchase[];
  personalPrices: PersonalPriceEntry[];
  streetRates: {
    USD: number;
    GBP: number;
    EUR: number;
  };
  useStreetRate: boolean;
  splitParticipants: SplitParticipant[];
  ajoGroupName: string;
  ajoContributionNgn: number;
  ajoFrequency: "Monthly" | "Weekly";
  ajoCurrentRoundIndex: number;
  ajoMembers: AjoMember[];
  billReminders: BillReminderItem[];
  savedBeneficiaries: SavedBeneficiary[];
  blocklist: BlocklistItem[];
}

export const STORAGE_KEY = "naija_hub_device_v1";

export const DEFAULT_DEVICE_STATE: NaijaHubDeviceState = {
  nepaIsOn: true,
  nepaLastChangedIso: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
  lightEvents: [
    {
      id: "le-1",
      state: "ON",
      timestampIso: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
      note: "Up NEPA! Voltage steady at 224V",
    },
    {
      id: "le-2",
      state: "OFF",
      timestampIso: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      note: "Feeder tripped after evening rain",
    },
    {
      id: "le-3",
      state: "ON",
      timestampIso: new Date(Date.now() - 19 * 3600 * 1000).toISOString(),
      note: "Morning supply restored",
    },
  ],
  dailySupply7Days: [
    { day: "Mon", hours: 14.5 },
    { day: "Tue", hours: 11.0 },
    { day: "Wed", hours: 16.5 },
    { day: "Thu", hours: 9.0 },
    { day: "Fri", hours: 15.0 },
    { day: "Sat", hours: 18.0 },
    { day: "Sun", hours: 13.5 },
  ],
  tokenPurchases: [
    {
      id: "tp-1",
      date: "2026-11-18",
      meterLabel: "Home Prepaid (IKEDC)",
      amountNgn: 20_000,
      unitsKwh: 95.46,
    },
    {
      id: "tp-2",
      date: "2026-11-04",
      meterLabel: "Shop Meter (Band B)",
      amountNgn: 15_000,
      unitsKwh: 219.3,
    },
  ],
  personalPrices: [
    {
      id: "pp-1",
      item: "PMS Petrol",
      unit: "1 Litre",
      marketOrStation: "NNPC retail, Lagos (15 Nov 2026)",
      priceNgn: 1_289,
      previousPriceNgn: 1_350,
      date: "15 Nov",
    },
    {
      id: "pp-2",
      item: "Cooking Gas (LPG)",
      unit: "12.5kg Refill",
      marketOrStation: "Lagos dealers (~₦1,480–1,650/kg)",
      priceNgn: 20_000,
      previousPriceNgn: 18_500,
      date: "12 Nov",
    },
    {
      id: "pp-3",
      item: "Yellow Garri",
      unit: "50kg Bag",
      marketOrStation: "Lagos markets (Mile 12 / Mushin)",
      priceNgn: 23_000,
      previousPriceNgn: 18_000,
      date: "Oct 2026",
    },
    {
      id: "pp-4",
      item: "Brown Beans",
      unit: "50kg Bag",
      marketOrStation: "Lagos markets (Oct 2026)",
      priceNgn: 110_000,
      previousPriceNgn: 105_000,
      date: "Oct 2026",
    },
  ],
  streetRates: {
    USD: 1_460, // parallel market (Aboki FX, 18 Nov 2026)
    GBP: 1_865, // parallel mid of ₦1,855–1,875
    EUR: 1_600, // estimate: CBN rate + ~7% parallel premium
  },
  useStreetRate: true,
  splitParticipants: [
    { id: "sp-1", name: "Tunde (Jollof + Peppered Turkey)", orderAmountNgn: 8_500 },
    { id: "sp-2", name: "Ngozi (Catfish Peppersoup + Chapman)", orderAmountNgn: 11_200 },
    { id: "sp-3", name: "Sadiq (Beef Suya Platter + Zobo)", orderAmountNgn: 7_800 },
  ],
  ajoGroupName: "Yaba Tech & Market Circle",
  ajoContributionNgn: 50_000,
  ajoFrequency: "Monthly",
  ajoCurrentRoundIndex: 2,
  ajoMembers: [
    { id: "aj-1", name: "Kemi Adeyemi", paidCurrentRound: true },
    { id: "aj-2", name: "Chuka Okafor", paidCurrentRound: true },
    { id: "aj-3", name: "Hauwa Bello", paidCurrentRound: true },
    { id: "aj-4", name: "Efe Oghene", paidCurrentRound: false },
    { id: "aj-5", name: "Damilola Peters", paidCurrentRound: true },
  ],
  billReminders: [
    {
      id: "br-1",
      title: "IKEDC Prepaid Meter Top-up",
      category: "ELECTRICITY",
      amountNgn: 25_000,
      dueDay: 25,
      paidThisMonth: false,
      beneficiaryCode: "0417-2290-8831",
    },
    {
      id: "br-2",
      title: "DSTV Compact Subscription",
      category: "CABLE_TV",
      amountNgn: 19_000,
      dueDay: 28,
      paidThisMonth: false,
      beneficiaryCode: "7029-4481-09",
    },
    {
      id: "br-3",
      title: "MTN 5G Router Monthly Plan",
      category: "INTERNET",
      amountNgn: 20_000,
      dueDay: 15,
      paidThisMonth: true,
      beneficiaryCode: "0803-555-0194",
    },
    {
      id: "br-4",
      title: "LWC Water & Estate Security Levy",
      category: "WATER",
      amountNgn: 12_000,
      dueDay: 5,
      paidThisMonth: true,
      beneficiaryCode: "LWC-SUR-8821",
    },
  ],
  savedBeneficiaries: [
    {
      id: "sb-1",
      label: "Flat 3B Prepaid Meter",
      type: "PREPAID_METER",
      provider: "IKEDC",
      number: "041722908831",
    },
    {
      id: "sb-2",
      label: "Mama's House Meter (Ibadan)",
      type: "PREPAID_METER",
      provider: "IBEDC",
      number: "45019928371",
    },
    {
      id: "sb-3",
      label: "Parlour GOtv Decoder",
      type: "CABLE_IUC",
      provider: "GOtv Supa",
      number: "2018493022",
    },
    {
      id: "sb-4",
      label: "Work Dual-SIM Data",
      type: "AIRTIME_DATA",
      provider: "MTN NG",
      number: "08035550194",
    },
  ],
  blocklist: [
    {
      id: "bl-1",
      identifier: "+234 906 000 4419",
      reason: "Fake bank 'BVN upgrade' WhatsApp impersonator",
      addedAt: "2026-11-12",
    },
    {
      id: "bl-2",
      identifier: "+234 812 998 0071",
      reason: "Fake SMS credit alert reversal scam",
      addedAt: "2026-11-16",
    },
  ],
};

export function loadDeviceState(): NaijaHubDeviceState {
  if (typeof window === "undefined") {
    return DEFAULT_DEVICE_STATE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_DEVICE_STATE)
      );
      return DEFAULT_DEVICE_STATE;
    }
    const parsed = JSON.parse(raw) as Partial<NaijaHubDeviceState>;
    return {
      ...DEFAULT_DEVICE_STATE,
      ...parsed,
    };
  } catch {
    return DEFAULT_DEVICE_STATE;
  }
}

export function saveDeviceState(state: NaijaHubDeviceState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or private mode safe fallback
  }
}

export function getDeviceStorageBytes(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
    return new Blob([raw]).size;
  } catch {
    return 0;
  }
}

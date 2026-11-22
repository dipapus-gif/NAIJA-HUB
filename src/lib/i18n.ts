export type Lang = "en" | "pcm";

export interface UssdEntry {
  id: string;
  category: "BANK" | "TELECOM" | "EMERGENCY" | "VERIFY";
  provider: string;
  titleEn: string;
  titlePcm: string;
  code: string;
  dialUri: string;
  noteEn: string;
  notePcm: string;
}

export const OFFLINE_CODES: UssdEntry[] = [
  {
    id: "gtb-transfer",
    category: "BANK",
    provider: "GTBank (GTCO)",
    titleEn: "Quick Banking & Transfers",
    titlePcm: "Sharp Transfer & Account Balance",
    code: "*737#",
    dialUri: "tel:*737%23",
    noteEn: "Airtime, transfers, BVN & cardless withdrawal",
    notePcm: "Buy card, send money sharp-sharp without data",
  },
  {
    id: "access-bank",
    category: "BANK",
    provider: "Access Bank",
    titleEn: "Access Magic Banking",
    titlePcm: "Access Quick Code",
    code: "*901#",
    dialUri: "tel:*901%23",
    noteEn: "Pay bills, buy airtime, check balance (*901*00#)",
    notePcm: "Settle bill, buy card or check your kobo (*901*00#)",
  },
  {
    id: "zenith-bank",
    category: "BANK",
    provider: "Zenith Bank",
    titleEn: "EazyBanking USSD",
    titlePcm: "Zenith Eazy Code",
    code: "*966#",
    dialUri: "tel:*966%23",
    noteEn: "Block compromised account fast with *966*911#",
    notePcm: "Lock account sharp-sharp if wahala burst: *966*911#",
  },
  {
    id: "uba-leo",
    category: "BANK",
    provider: "UBA",
    titleEn: "UBA Magic Banking",
    titlePcm: "UBA Sharp Code",
    code: "*919#",
    dialUri: "tel:*919%23",
    noteEn: "Prepaid electricity, transfers & panic lock *919*10#",
    notePcm: "Buy NEPA token, send money or lock account *919*10#",
  },
  {
    id: "firstbank",
    category: "BANK",
    provider: "FirstBank",
    titleEn: "FirstBank Quick Banking",
    titlePcm: "FirstBank *894# Code",
    code: "*894#",
    dialUri: "tel:*894%23",
    noteEn: "Transfers *894*Amount*Account# & mini-statement",
    notePcm: "Send money *894*Amount*Account# even with zero data",
  },
  {
    id: "opay-ussd",
    category: "BANK",
    provider: "OPay",
    titleEn: "OPay Offline USSD",
    titlePcm: "OPay No-Data Code",
    code: "*955#",
    dialUri: "tel:*955%23",
    noteEn: "Transfer, buy airtime/data, electricity token & OTP",
    notePcm: "Run OPay transfer, buy NEPA token when network bad",
  },
  {
    id: "moniepoint-ussd",
    category: "BANK",
    provider: "Moniepoint",
    titleEn: "Moniepoint USSD & Panic Lock",
    titlePcm: "Moniepoint Code & Lock",
    code: "*5573#",
    dialUri: "tel:*5573%23",
    noteEn: "Transfers, balance check & *5573*911# freeze",
    notePcm: "Check balance or press *5573*911# block thief",
  },
  {
    id: "ncc-balance",
    category: "TELECOM",
    provider: "MTN • Airtel • Glo • 9mobile",
    titleEn: "Unified Airtime Balance",
    titlePcm: "Check Credit Balance (All Network)",
    code: "*310#",
    dialUri: "tel:*310%23",
    noteEn: "Harmonized NCC code across all Nigerian SIMs",
    notePcm: "One single NCC code for MTN, Airtel, Glo & 9mobile",
  },
  {
    id: "ncc-data",
    category: "TELECOM",
    provider: "MTN • Airtel • Glo • 9mobile",
    titleEn: "Buy Data Plan / Check Data",
    titlePcm: "Buy Data (*312#) / Check Data (*323#)",
    code: "*312#",
    dialUri: "tel:*312%23",
    noteEn: "Dial *312# for data bundles or *323# for data balance",
    notePcm: "Press *312# buy data plan or *323# see wetin remain",
  },
  {
    id: "ncc-nin",
    category: "VERIFY",
    provider: "NIMC / All Networks",
    titleEn: "Verify NIN & Linked SIMs",
    titlePcm: "Check Your NIN & Linked Line",
    code: "*996#",
    dialUri: "tel:*996%23",
    noteEn: "Check NIN linkage status; *346# retrieves 11-digit NIN",
    notePcm: "Confirm say your SIM link to NIN; *346# go show NIN",
  },
  {
    id: "bvn-check",
    category: "VERIFY",
    provider: "NIBSS (All Banks)",
    titleEn: "Retrieve Your BVN",
    titlePcm: "See Your 11-Digit BVN",
    code: "*565*0#",
    dialUri: "tel:*565*0%23",
    noteEn: "Works on the phone number registered with your bank",
    notePcm: "Dial am with the SIM wey you take open bank account",
  },
  {
    id: "emergency-112",
    category: "EMERGENCY",
    provider: "National Emergency (Toll-Free)",
    titleEn: "Nigeria National Emergency Line",
    titlePcm: "All-Nigeria Emergency (Free Call)",
    code: "112",
    dialUri: "tel:112",
    noteEn: "Police, Ambulance, Fire & Disaster dispatch nationwide",
    notePcm: "Free call for Police, Fire Service & Ambulance anywhere",
  },
  {
    id: "lasema-767",
    category: "EMERGENCY",
    provider: "LASEMA (Lagos State)",
    titleEn: "Lagos Emergency & Flood Rescue",
    titlePcm: "Lagos LASEMA Rescue & Flood Line",
    code: "767",
    dialUri: "tel:767",
    noteEn: "24/7 toll-free Lagos accident, fire & flood response",
    notePcm: "24/7 free Lagos rescue for accident, fire or heavy flood",
  },
  {
    id: "frsc-122",
    category: "EMERGENCY",
    provider: "FRSC Road Safety",
    titleEn: "Highway Crash & Tow Rescue",
    titlePcm: "Road Safety Express Rescue",
    code: "122",
    dialUri: "tel:122",
    noteEn: "Federal Road Safety Corps emergency response",
    notePcm: "Call Road Safety quick if motor spoil or accident happen",
  },
];

export const COPY = {
  en: {
    badgeTime: "05:59 → 06:00 • LAGOS / ABUJA / PH / KANO",
    heroTitle: "One light app for everyday Naija life.",
    heroSubtitle:
      "Most Nigerians juggle five or six heavy apps on shaky 3G data just to buy meter tokens, track NEPA, check pump prices, calculate take-home pay, or run monthly Ajo. Naija Hub puts ten offline-first utilities in your pocket — all data stays on your phone.",
    ctaOpenApp: "Open the 10 Utilities",
    ctaWatchStory: "Scroll the Visual Story",
    ctaRunTests: "Run LIET's Calc Tests",
    langLabel: "English",
    offlineNote: "100% Offline-First • Local Device Storage",
    storyHeader: "From 05:59 Dawn to Evening Esusu",
    storySub:
      "Every chapter below pairs real street footage and documentary imagery with live community modules built for weak networks.",
    workbenchTitle: "The 10 Offline-First Utilities",
    workbenchSub:
      "Built as an installable web app for Android & iPhone. Switch between Full Desktop Studio and Phone Frame below — every calculation runs locally in 0ms with zero cloud lock-in.",
    privacyBanner:
      "Privacy promise: Your personal logs, bills, Ajo rounds, and blocklist stay strictly inside your phone's local storage.",
    utilities: {
      light: {
        name: "Light Tracker",
        short: "NEPA on/off log, supply hours & real ₦/kWh",
      },
      fuel: {
        name: "Fuel & Energy",
        short: "Gen vs NEPA cost/kWh + trip fuel estimator",
      },
      price: {
        name: "Price Watch",
        short: "Track PMS, gas, rice, garri & delta since last entry",
      },
      rates: {
        name: "Naira Rates",
        short: "USD, GBP & EUR with reference or street rate",
      },
      tax: {
        name: "Tax & VAT",
        short: "Nigeria PAYE take-home & 7.5% VAT calculator",
      },
      split: {
        name: "Split the Bill",
        short: "Equal or itemized order split + shared delivery/tip",
      },
      ajo: {
        name: "Ajo / Esusu",
        short: "Rotating contribution rounds & who collects next",
      },
      bills: {
        name: "Bill Reminders",
        short: "Monthly due dates, paid marks & saved beneficiaries",
      },
      codes: {
        name: "Codes & Emergency",
        short: "Bank USSD, network codes, NAFDAC & tap-to-dial",
      },
      scam: {
        name: "Scam Check",
        short: "Red-flag analyzer & personal phone blocklist",
      },
    },
  },
  pcm: {
    badgeTime: "05:59 → 06:00 • EKO / ABUJA / PH / KANO",
    heroTitle: "One sharp app wey sabi Naija hustle.",
    heroSubtitle:
      "Plenty people for Naija dey jump inside five or six heavy apps when network dey blink — just to buy NEPA token, check fuel price, share bill, or run monthly Ajo. Naija Hub gather ten correct tools inside one small app wey dey work offline. All your data dey stay inside your phone.",
    ctaOpenApp: "Open All 10 Tools",
    ctaWatchStory: "Follow the Street Torí",
    ctaRunTests: "Test LIET Maths Engine",
    langLabel: "Pidgin",
    offlineNote: "Work Without Data • Everything Dey Your Phone",
    storyHeader: "From 05:59 Morning Danfo Reach Night Ajo",
    storySub:
      "Scroll make you see real Naija street video and picture torí alongside live community updates for light, fuel, garri and road.",
    workbenchTitle: "All 10 Offline Tools Inside One Place",
    workbenchSub:
      "Install am for Android or iPhone. Toggle Desktop Studio or Phone Screen below — every calculation dey run sharp-sharp inside your phone even for Airplane Mode.",
    privacyBanner:
      "No fear: Your NEPA log, salary check, Ajo list and blocklist no dey comot inside your phone.",
    utilities: {
      light: {
        name: "Light Tracker",
        short: "Tap Up NEPA / No Light, see hours & real ₦/kWh",
      },
      fuel: {
        name: "Fuel & Gen",
        short: "Gen vs NEPA kWh cost + motor trip fuel money",
      },
      price: {
        name: "Price Watch",
        short: "Log petrol, gas, rice, garri & see how price change",
      },
      rates: {
        name: "Aboki / Naira Rate",
        short: "Change Dollar, Pound & Euro with official or street rate",
      },
      tax: {
        name: "PAYE Tax & VAT",
        short: "Calculate wetin go enter hand & 7.5% VAT",
      },
      split: {
        name: "Share Bill",
        short: "Share equal-equal or pay wetin you chop + rider money",
      },
      ajo: {
        name: "Ajo / Esusu",
        short: "Track contribution turn & see person wey dey pack next",
      },
      bills: {
        name: "Bill & Meter List",
        short: "Monthly bill reminder, mark paid & save meter/IUC",
      },
      codes: {
        name: "USSD & Emergency",
        short: "Bank code, network code, NAFDAC & one-tap call",
      },
      scam: {
        name: "Shine Your Eye",
        short: "Catch Yahoo/scam format quick & block bad number",
      },
    },
  },
} as const;

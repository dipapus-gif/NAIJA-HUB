export const TOOL_LIST: { id: string; name: string }[] = [
  { id: "data", name: "Data & airtime budget" }, { id: "debts", name: "Debt & loan tracker" }, { id: "shop", name: "Shop ledger & stock" },
  { id: "savings", name: "Savings & school fees" }, { id: "units", name: "Units & measures" }, { id: "health", name: "Health basics" },
  { id: "docs", name: "Document checklists" }, { id: "holidays", name: "Holidays & travel" }, { id: "phrases", name: "Phrasebook with voice" },
  { id: "invoice", name: "Invoice maker" }, { id: "usd", name: "Dollar income tracker" }, { id: "power", name: "Power planner" },
  { id: "dev", name: "Developer toolbox" }, { id: "qr", name: "Link & QR generator" }, { id: "phish", name: "Phishing & URL checker" },
  { id: "jobs", name: "Job & gig tracker" }, { id: "api", name: "Mock API & status checker" },
];
export const UTILITY_KEYS = ["light", "fuel", "price", "rates", "tax", "split", "ajo", "bills", "codes", "scam"] as const;

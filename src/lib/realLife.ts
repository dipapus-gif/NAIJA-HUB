/**
 * "Real life" stories for every utility and toolkit tool.
 * People are fictional. Every naira figure is an ILLUSTRATIVE EXAMPLE worked out in the card so you can
 * check the arithmetic; it is not a quote of today's market price. Swap in your own numbers in the tool.
 */
export type Group = "Power & fuel" | "Money" | "Community & health" | "Safety & papers" | "Work & tech";

export interface RealLife {
  id: string;
  name: string;
  group: Group;
  href: string;
  who: string;       // fictional person
  story: string;     // real-life situation
  maths: string;     // worked example
  result: string;    // the example answer
}

const T = (id: string) => `/tools#${id}`;
const U = (k: string) => `/?u=${k}`;

export const REAL_LIFE: RealLife[] = [
  // ---- the ten live utilities
  { id: "light", name: "Power tracker", group: "Power & fuel", href: U("light"), who: "Ada, tailor in Ikeja",
    story: "Ada logs the hours NEPA was on each day, so she knows when to book rush orders and when to run her generator.",
    maths: "A 4-hour outage on a generator that burns 1.5 litres an hour uses 4 × 1.5 = 6 litres. At an example ₦1,000 a litre:", result: "₦6,000 for one outage you can now plan around." },
  { id: "fuel", name: "Fuel & energy cost", group: "Power & fuel", href: U("fuel"), who: "Musa, bolt driver in Kano",
    story: "Musa compares what a litre really costs him across stations and across generator versus NEPA at home.",
    maths: "If one station is an example ₦50 a litre cheaper and he buys 40 litres a week: 50 × 40 × 4 weeks =", result: "₦8,000 a month back in his pocket." },
  { id: "price", name: "Market price watch", group: "Money", href: U("price"), who: "Mama Chidi, Onitsha",
    story: "Before she stocks up, Mama Chidi checks the price trend for rice, sugar and gas and buys when the price dips.",
    maths: "An example 10 kg bag at ₦2,500 versus ₦2,300 saves ₦200 a bag. Twelve bags a month:", result: "₦2,400 saved without changing what she buys." },
  { id: "rates", name: "Naira exchange rates", group: "Money", href: U("rates"), who: "Tolu, freelance designer in Lagos",
    story: "Tolu checks the official and street rate before she converts a client's dollars.",
    maths: "On $300, a gap of an example ₦30 per dollar between two rates is 300 × 30 =", result: "₦9,000 difference, so choose the rate on purpose." },
  { id: "tax", name: "Tax & VAT", group: "Money", href: U("tax"), who: "Emeka, shop owner in Enugu",
    story: "Emeka works out the 7.5% VAT on a quote so the price he gives a customer is right the first time.",
    maths: "On a ₦100,000 job, VAT of 7.5% is ₦7,500. So the customer pays", result: "₦107,500 in total. Confirm your own tax position with an accountant." },
  { id: "split", name: "Split the bill", group: "Money", href: U("split"), who: "Bisi and friends",
    story: "Six friends after dinner, one bill, no arguments: split it equally or by what each person ate.",
    maths: "A ₦45,000 bill split six ways is 45,000 ÷ 6 =", result: "₦7,500 each." },
  { id: "ajo", name: "Ajo / Esusu circle", group: "Community & health", href: "/ajo", who: "The Sunday Market Women's circle",
    story: "Ten women pay in on the same day each month, everyone can see who has paid, and the pot goes to the next person in turn.",
    maths: "Ten members paying an example ₦20,000 each: 10 × 20,000 =", result: "₦200,000 for whoever's turn it is. Only join circles run by people you trust." },
  { id: "bills", name: "Bill reminders", group: "Money", href: U("bills"), who: "Kunle, civil servant in Abuja",
    story: "Kunle saves his due dates and gets a reminder before electricity, cable and school fees fall due.",
    maths: "If a late fee is an example ₦1,500 and he used to miss two bills a year: 2 × 1,500 =", result: "₦3,000 a year not lost to late fees." },
  { id: "codes", name: "USSD & emergency codes", group: "Safety & papers", href: U("codes"), who: "Grace, nurse in Port Harcourt",
    story: "Grace keeps her bank's USSD codes and emergency numbers in one place, even with no data.",
    maths: "If a bank trip costs an example ₦1,500 transport round trip and she skips four a month: 1,500 × 4 =", result: "₦6,000 a month saved, plus the hours." },
  { id: "scam", name: "Scam check", group: "Safety & papers", href: U("scam"), who: "Yakubu, student in Zaria",
    story: "A text says his account is blocked and asks him to tap a link. He checks it first and finds the warning signs.",
    maths: "Losing an example ₦50,000 to one fake link is the same as 50,000 ÷ 3,000 =", result: "about 16 months of a ₦3,000 data bundle. Checking takes a minute." },

  // ---- the toolkit (17)
  { id: "data", name: "Data & airtime budget", group: "Money", href: T("data"), who: "Ife, undergraduate in Ibadan",
    story: "Ife logs each recharge to see which month and which network eat the most.",
    maths: "Four recharges of an example ₦2,000 a month: 4 × 2,000 =", result: "₦8,000 a month, so a bigger plan might be cheaper per GB." },
  { id: "debts", name: "Debt & loan tracker", group: "Money", href: T("debts"), who: "Chika, trader in Aba",
    story: "Chika writes down who owes her and who she owes, with a reminder date for each.",
    maths: "Three customers owing an example ₦15,000, ₦8,000 and ₦22,000:", result: "₦45,000 she can now chase on a set day." },
  { id: "shop", name: "Shop ledger & stock", group: "Money", href: T("shop"), who: "Alhaji Bello, provision shop in Kaduna",
    story: "He records daily sales and expenses so he knows his real profit, not just how busy the shop felt.",
    maths: "Sales of ₦85,000 minus an example ₦62,000 for stock and costs:", result: "₦23,000 profit for the day." },
  { id: "savings", name: "Savings & school fees", group: "Money", href: T("savings"), who: "Funmi, mother of two in Ogun",
    story: "Funmi sets a monthly target and watches the countdown to the next term.",
    maths: "An example ₦240,000 in fees due in 6 months: 240,000 ÷ 6 =", result: "₦40,000 to set aside each month." },
  { id: "units", name: "Units & measures", group: "Safety & papers", href: T("units"), who: "Dayo, buying land in Ogun",
    story: "Dayo converts plots, acres and square metres so he knows exactly how much land a price covers.",
    maths: "A plot listed at ₦9,000,000 for 600 m²: 9,000,000 ÷ 600 =", result: "₦15,000 per square metre to compare with other offers." },
  { id: "health", name: "Health basics", group: "Community & health", href: T("health"), who: "Hauwa, new mother in Sokoto",
    story: "Hauwa keeps her baby's vaccine dates and medicine alarms in one place. The tool gives first-aid basics, not a diagnosis.",
    maths: "Missing one clinic visit can mean another trip. An example ₦2,000 transport each way:", result: "₦4,000 per missed visit avoided by an on-time reminder." },
  { id: "docs", name: "Document checklists", group: "Safety & papers", href: T("docs"), who: "Obinna, applying for a passport",
    story: "Obinna checks what to bring for NIN, passport, licence, CAC or JAMB before he leaves home. Confirm fees at the official office.",
    maths: "A second trip because one paper was missing, at an example ₦3,000 return transport:", result: "₦3,000 and a lost day avoided." },
  { id: "holidays", name: "Holidays & travel", group: "Community & health", href: T("holidays"), who: "Ngozi, travelling home for Christmas",
    story: "Ngozi sees the public holidays and plans her trip before fares go up.",
    maths: "If booking early saves an example ₦5,000 on a ₦25,000 fare, that is 5,000 ÷ 25,000 =", result: "20% off by planning ahead." },
  { id: "phrases", name: "Phrasebook with voice", group: "Community & health", href: T("phrases"), who: "Tunde, posted to Maiduguri",
    story: "Tunde learns greetings and market phrases in Hausa and hears them spoken before he arrives.",
    maths: "Ten phrases a day for a week is 10 × 7 =", result: "70 phrases before his first market day." },
  { id: "invoice", name: "Invoice maker", group: "Work & tech", href: T("invoice"), who: "Sade, event planner in Lagos",
    story: "Sade makes a clean PDF invoice in naira or dollars and sends it by WhatsApp.",
    maths: "Three items of an example ₦120,000, ₦45,000 and ₦35,000 add up to", result: "₦200,000 on one tidy invoice." },
  { id: "usd", name: "Dollar income tracker", group: "Work & tech", href: T("usd"), who: "Kelechi, remote developer in Enugu",
    story: "Kelechi tracks each dollar payment minus fees, at the rate he actually got.",
    maths: "$1,000 less an example $25 fee leaves $975. At an example ₦1,450 per dollar: 975 × 1,450 =", result: "₦1,413,750." },
  { id: "power", name: "Power planner", group: "Power & fuel", href: T("power"), who: "Nkechi, running a small salon",
    story: "Nkechi adds up her appliances to see what inverter and battery size she needs.",
    maths: "A 300 W load for 6 hours is 300 × 6 =", result: "1,800 Wh, so she can size the battery before she buys." },
  { id: "dev", name: "Developer toolbox", group: "Work & tech", href: T("dev"), who: "Ahmed, junior developer in Kano",
    story: "Ahmed formats JSON, decodes Base64 and tests a regex offline, with no data and no sign-up.",
    maths: "Ten quick checks a day without opening a heavy site or paying for data.", result: "Works with no internet at all." },
  { id: "qr", name: "Link & QR generator", group: "Work & tech", href: T("qr"), who: "Amaka, bakery in Owerri",
    story: "Amaka prints a WhatsApp click-to-chat QR on her boxes so customers message her straight away.",
    maths: "If 5 of every 100 box customers scan and order an example ₦6,000 cake, then 5 × 6,000 =", result: "₦30,000 from every 100 boxes. This is an example, not a promise." },
  { id: "phish", name: "Phishing & URL checker", group: "Safety & papers", href: T("phish"), who: "Zainab, small-business owner",
    story: "Zainab pastes a suspicious bank link and the tool lists look-alike warning signs before she taps.",
    maths: "One careless tap can cost far more than a minute spent checking.", result: "Check first, tap second." },
  { id: "jobs", name: "Job & gig tracker", group: "Work & tech", href: T("jobs"), who: "Bola, graduate job-hunting in Lagos",
    story: "Bola logs each application, interview and follow-up so nothing slips.",
    maths: "Twenty applications and five follow-ups sent this month:", result: "25 actions she can see on one list." },
  { id: "api", name: "Mock API & status checker", group: "Work & tech", href: T("api"), who: "Seun, building an app",
    story: "Seun designs a mock endpoint to test his app and pings his live service to see if it is up.",
    maths: "A check every morning instead of waiting for users to complain.", result: "Find outages before customers do." },
];

export const GROUPS: Group[] = ["Power & fuel", "Money", "Community & health", "Safety & papers", "Work & tech"];

export type Where = "Server" | "Your device" | "Third party";

export interface DataItem {
  id: string;
  name: string;
  where: Where;
  data: string;
  purpose: string;
  basis: string;
  storedIn: string;
  access: string;
  retention: string;
  sensitive?: boolean;
}

/** One row per kind of personal data Naija Hub touches. Keep this in step with the code. */
export const DATA_INVENTORY: DataItem[] = [
  { id: "account", name: "Account", where: "Server", data: "Name, email address, scrypt password hash, created date", purpose: "Create your account and sign you in", basis: "Contract", storedIn: "Neon Postgres (table users)", access: "You; the service operator. Passwords are never readable.", retention: "While the account exists. Deleted on request." },
  { id: "session", name: "Session cookie", where: "Your device", data: "Signed token containing your user ID, 30-day expiry (cookie naija_hub_session, HTTP-only)", purpose: "Keep you signed in", basis: "Contract (strictly necessary)", storedIn: "Your browser", access: "You; sent to our server with each request", retention: "30 days or until you sign out" },
  { id: "qr", name: "QR sign-in session", where: "Server", data: "Random code, hashed secret, the user ID that approved it, expiry", purpose: "Sign in on a computer by scanning a code with a signed-in phone", basis: "Contract", storedIn: "Neon Postgres (table qr_login_sessions)", access: "Service operator", retention: "3 minutes; removed when used" },
  { id: "health", name: "Health requests", where: "Server", data: "Patient name, phone number, state, chosen hospital, preferred time, urgency, free-text notes, optional account ID, status, reference", purpose: "Record the request and let you look it up with your reference and phone. It is not sent to hospitals.", basis: "Explicit consent (health data is special-category)", storedIn: "Neon Postgres (table health_requests)", access: "The person who knows the reference and phone; the service operator", retention: "Kept until you ask for deletion. Automatic expiry is not built yet.", sensitive: true },
  { id: "ajo", name: "Ajo circles", where: "Server", data: "Circle name, contribution amount, organiser's pool bank/account number/account name, members' names, phone numbers and payout accounts, payment references, payout records", purpose: "Track who has paid into the pool and whose turn it is to collect", basis: "Contract", storedIn: "Neon Postgres (tables ajo_circles, ajo_members, ajo_payments, ajo_payouts)", access: "Members see the circle, pool account and payment status. Only the organiser sees phone numbers and payout accounts. The service operator.", retention: "Kept until you ask for deletion. Automatic expiry is not built yet.", sensitive: true },
  { id: "community", name: "Community reports", where: "Server", data: "Area, street, price, transit or power-status details you choose to submit", purpose: "Show shared price, power and transit information", basis: "Legitimate interest / consent", storedIn: "Neon Postgres (table crowd_prices and related)", access: "Shown to other users without your name", retention: "May be kept in anonymous form" },
  { id: "copilot", name: "AI co-pilot messages", where: "Server", data: "The question you type and the tool context needed to answer it", purpose: "Answer your question", basis: "Contract", storedIn: "Not stored by Naija Hub. When an AI model is switched on, the message is sent to the AI provider through Vercel AI Gateway; otherwise a built-in rule-based engine answers on our server.", access: "Service operator (transiently); the AI provider when enabled", retention: "Not kept by us. The provider’s own retention rules apply when it is enabled." },
  { id: "logs", name: "Server logs", where: "Third party", data: "IP address, browser type, requested page, time, error details", purpose: "Security, abuse prevention and fixing bugs", basis: "Legitimate interest", storedIn: "Vercel", access: "Service operator", retention: "Set by Vercel’s plan; short-term" },
  { id: "video", name: "Background videos", where: "Third party", data: "Your IP address and browser type are visible to the video host when its videos load", purpose: "Play the motion-story footage", basis: "Legitimate interest", storedIn: "Videos are served from videos.pexels.com", access: "Pexels", retention: "Governed by Pexels" },
  { id: "prefs", name: "Theme, language and state", where: "Your device", data: "Light/dark choice, language, selected state", purpose: "Remember your settings", basis: "Consent (preference)", storedIn: "Browser localStorage", access: "You", retention: "Until you clear site data" },
  { id: "utilities", name: "Utility records", where: "Your device", data: "Light logs, bills and meter numbers, saved beneficiaries, personal prices, local Ajo notes, blocklist", purpose: "Make the utilities work offline", basis: "Contract", storedIn: "Browser localStorage", access: "You. Not received by us.", retention: "Until you clear site data" },
  { id: "tools", name: "Toolkit records", where: "Your device", data: "Recharges, debts and phone numbers, shop sales and stock, savings goals, child’s date of birth, saved clinics and medicines, invoices, dollar income, job applications, tool settings", purpose: "Make the 17 Toolkit tools work without an account", basis: "Contract", storedIn: "Browser localStorage (keys beginning nh_)", access: "You. Not received by us.", retention: "Until you clear site data", sensitive: true },
  { id: "myreqs", name: "Saved request references", where: "Your device", data: "Reference, type, hospital and date of health requests you made", purpose: "Let you find your requests again", basis: "Consent", storedIn: "Browser localStorage", access: "You", retention: "Until you clear site data" },
  { id: "cache", name: "Offline cache", where: "Your device", data: "Copies of app pages and images (not account data or API responses)", purpose: "Let the app open without data", basis: "Contract", storedIn: "Service worker cache", access: "You", retention: "Until replaced or you clear site data" },
  { id: "outbound", name: "Links you open or test", where: "Third party", data: "WhatsApp click-to-chat opens wa.me; the status checker contacts addresses you type; phrasebook voice uses your device’s speech engine", purpose: "Features you choose to use", basis: "Your instruction", storedIn: "Not stored by Naija Hub", access: "The service you contact (e.g. WhatsApp)", retention: "Governed by that service" },
];

export const PROCESSORS = [
  { name: "Vercel", role: "Hosting, server logs, optional AI Gateway", region: "Global edge network (USA)" },
  { name: "Neon", role: "Postgres database for accounts, health requests and Ajo circles", region: "Set by the project’s region" },
  { name: "AI model provider (optional)", role: "Generates co-pilot replies when switched on", region: "Depends on provider" },
  { name: "Pexels", role: "Hosts background videos", region: "Global CDN" },
];

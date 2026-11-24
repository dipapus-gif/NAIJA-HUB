import { createHmac, timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";

let ready = false;
export async function ensurePaymentTables() {
  if (ready) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS payment_events (
      id SERIAL PRIMARY KEY,
      provider TEXT NOT NULL,
      event_key TEXT NOT NULL UNIQUE,
      event TEXT NOT NULL,
      reference TEXT,
      tx_hash TEXT,
      amount TEXT,
      currency TEXT,
      status TEXT,
      payload JSONB NOT NULL,
      received_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  ready = true;
}

/** Blockradar signs the raw body with HMAC-SHA512 (hex) using the wallet API key. */
export function verifyBlockradar(raw: string, header: string | null, key: string) {
  if (!header) return false;
  const expected = createHmac("sha512", key).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header.trim().toLowerCase());
  return a.length === b.length && timingSafeEqual(a, b);
}

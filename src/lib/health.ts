import { randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";

let ready = false;
export async function ensureHealthTable() {
  if (ready) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS health_requests (
      id SERIAL PRIMARY KEY,
      ref TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      state TEXT NOT NULL,
      hospital TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      preferred_at TEXT,
      urgency TEXT NOT NULL DEFAULT 'ROUTINE',
      details TEXT,
      user_id INTEGER,
      status TEXT NOT NULL DEFAULT 'PENDING_CONFIRMATION',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  ready = true;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newRef() {
  const bytes = randomBytes(6);
  return "NH-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Accepts 080…, 070…, 090…, +234… and 234… forms; returns normalised 0XXXXXXXXXX or null. */
export function normalisePhone(raw: string): string | null {
  const d = raw.replace(/[\s\-()]/g, "");
  const m = d.match(/^(?:\+?234|0)([789][01]\d{8})$/);
  return m ? "0" + m[1] : null;
}

export const REQUEST_TYPES = ["APPOINTMENT", "ANTENATAL", "BED"] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

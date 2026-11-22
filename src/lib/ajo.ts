import { randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";

let ready = false;
export async function ensureAjoTables() {
  if (ready) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ajo_circles (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      amount_ngn INTEGER NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'Monthly',
      organiser_id INTEGER NOT NULL,
      pool_bank TEXT NOT NULL,
      pool_acct_no TEXT NOT NULL,
      pool_acct_name TEXT NOT NULL,
      round INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'OPEN',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ajo_members (
      id SERIAL PRIMARY KEY,
      circle_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      user_id INTEGER,
      position INTEGER NOT NULL,
      payout_bank TEXT,
      payout_acct TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (circle_id, position)
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ajo_payments (
      id SERIAL PRIMARY KEY,
      circle_id INTEGER NOT NULL,
      round INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      amount_ngn INTEGER NOT NULL,
      reference TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'REPORTED',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      confirmed_at TIMESTAMP,
      UNIQUE (circle_id, round, member_id)
    );
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ajo_payouts (
      id SERIAL PRIMARY KEY,
      circle_id INTEGER NOT NULL,
      round INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      amount_ngn INTEGER NOT NULL,
      reference TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (circle_id, round)
    );
  `);
  ready = true;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newCircleCode() {
  const b = randomBytes(6);
  return "AJO-" + Array.from(b, (x) => ALPHABET[x % ALPHABET.length]).join("");
}

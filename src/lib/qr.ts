import { createHash, randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export const QR_TTL_MS = 3 * 60_000;

let ready = false;
export async function ensureQrTable() {
  if (ready) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS qr_login_sessions (
      code TEXT PRIMARY KEY,
      secret_hash TEXT NOT NULL,
      user_id INTEGER,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  ready = true;
}

export const hashSecret = (s: string) => createHash("sha256").update(s).digest("hex");
export const newToken = (bytes = 24) => randomBytes(bytes).toString("base64url");

import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const SESSION_COOKIE = "naija_hub_session";
const SESSION_DAYS = 30;

function secret() {
  return (
    process.env.SESSION_SECRET ||
    createHmac("sha256", "naija-hub").update(process.env.DATABASE_URL || "dev").digest("hex")
  );
}

let tablesReady = false;
export async function ensureUsersTable() {
  if (tablesReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  tablesReady = true;
}

export function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 64, (err, key) =>
      err ? reject(err) : resolve(`${salt.toString("hex")}:${key.toString("hex")}`)
    )
  );
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return Promise.resolve(false);
  return new Promise((resolve) =>
    scrypt(password, Buffer.from(saltHex, "hex"), 64, (err, key) => {
      if (err) return resolve(false);
      const expected = Buffer.from(keyHex, "hex");
      resolve(expected.length === key.length && timingSafeEqual(expected, key));
    })
  );
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: number) {
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const good = sign(payload);
  if (good.length !== sig.length || !timingSafeEqual(Buffer.from(good), Buffer.from(sig))) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof uid === "number" && exp > Date.now() ? uid : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: number) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const uid = readToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!uid) return null;
  try {
    await ensureUsersTable();
    const [u] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, uid))
      .limit(1);
    return u ?? null;
  } catch {
    return null;
  }
}

let qrReady = false;
export async function ensureQrTable() {
  if (qrReady) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS qr_logins (
      token TEXT PRIMARY KEY,
      user_id INTEGER,
      expires_at TIMESTAMP NOT NULL,
      consumed BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);
  qrReady = true;
}

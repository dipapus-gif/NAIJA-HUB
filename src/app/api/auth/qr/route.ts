import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { QR_TTL_MS, ensureQrTable, hashSecret, newToken } from "@/lib/qr";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await ensureQrTable();
    await db.execute(sql`DELETE FROM qr_login_sessions WHERE expires_at < NOW() - INTERVAL '1 hour'`);
    const code = newToken(18);
    const secret = newToken(24);
    const expiresAt = new Date(Date.now() + QR_TTL_MS);
    await db.execute(
      sql`INSERT INTO qr_login_sessions (code, secret_hash, expires_at) VALUES (${code}, ${hashSecret(secret)}, ${expiresAt.toISOString()})`
    );
    return NextResponse.json({ ok: true, code, secret, expiresAt: expiresAt.toISOString() });
  } catch (e) {
    console.error("qr create error", e);
    return NextResponse.json({ ok: false, error: "Could not create QR code." }, { status: 500 });
  }
}

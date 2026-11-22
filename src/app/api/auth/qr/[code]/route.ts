import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { setSessionCookie } from "@/lib/auth";
import { ensureQrTable, hashSecret } from "@/lib/qr";

export const dynamic = "force-dynamic";

// Polled by the device showing the QR. Claims the login once approved.
export async function GET(request: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const secret = new URL(request.url).searchParams.get("secret") || "";
  try {
    await ensureQrTable();
    const res = await db.execute(
      sql`SELECT secret_hash, user_id, expires_at FROM qr_login_sessions WHERE code = ${code} LIMIT 1`
    );
    const row = res.rows[0] as { secret_hash: string; user_id: number | null; expires_at: string } | undefined;
    if (!row || row.secret_hash !== hashSecret(secret)) return NextResponse.json({ status: "invalid" }, { status: 404 });
    if (new Date(row.expires_at).getTime() < Date.now()) return NextResponse.json({ status: "expired" });
    if (row.user_id == null) return NextResponse.json({ status: "pending" });
    // Single use: delete atomically, only the winner gets the session.
    const del = await db.execute(sql`DELETE FROM qr_login_sessions WHERE code = ${code} AND user_id IS NOT NULL RETURNING user_id`);
    if (!del.rows.length) return NextResponse.json({ status: "expired" });
    await setSessionCookie(Number((del.rows[0] as { user_id: number }).user_id));
    return NextResponse.json({ status: "approved" });
  } catch (e) {
    console.error("qr poll error", e);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

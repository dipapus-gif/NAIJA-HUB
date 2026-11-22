import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { ensureQrTable } from "@/lib/qr";

export const dynamic = "force-dynamic";

// Called by an already logged-in device after the user taps "Approve".
export async function POST(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false, error: "Log in on this device first." }, { status: 401 });
  try {
    await ensureQrTable();
    const r = await db.execute(
      sql`UPDATE qr_login_sessions SET user_id = ${user.id} WHERE code = ${code} AND user_id IS NULL AND expires_at > NOW() RETURNING code`
    );
    if (!r.rows.length) return NextResponse.json({ ok: false, error: "This QR code has expired or was already used." }, { status: 410 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("qr approve error", e);
    return NextResponse.json({ ok: false, error: "Could not approve." }, { status: 500 });
  }
}

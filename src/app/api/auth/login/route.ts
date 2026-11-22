import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureUsersTable, setSessionCookie, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    await ensureUsersTable();
    const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const ok = u ? await verifyPassword(password, u.passwordHash) : false;
    if (!u || !ok)
      return NextResponse.json({ ok: false, error: "Incorrect email or password." }, { status: 401 });
    await setSessionCookie(u.id);
    return NextResponse.json({ ok: true, user: { id: u.id, name: u.name, email: u.email } });
  } catch (e) {
    console.error("login error", e);
    return NextResponse.json({ ok: false, error: "Could not sign in. Try again." }, { status: 500 });
  }
}

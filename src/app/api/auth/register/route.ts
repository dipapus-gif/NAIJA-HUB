import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureUsersTable, hashPassword, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim().slice(0, 80);
    const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
    const password = String(body.password || "");
    if (!name) return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
    if (password.length < 8 || password.length > 128)
      return NextResponse.json({ ok: false, error: "Password must be 8–128 characters." }, { status: 400 });
    if (body.acceptTerms !== true)
      return NextResponse.json({ ok: false, error: "You must accept the Terms and Privacy Policy." }, { status: 400 });

    await ensureUsersTable();
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length)
      return NextResponse.json({ ok: false, error: "An account with this email already exists." }, { status: 409 });

    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash: await hashPassword(password) })
      .returning({ id: users.id, name: users.name, email: users.email });
    await setSessionCookie(user.id);
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json({ ok: false, error: "Could not create account. Try again." }, { status: 500 });
  }
}

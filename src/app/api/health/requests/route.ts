import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { REQUEST_TYPES, ensureHealthTable, newRef, normalisePhone, type RequestType } from "@/lib/health";
import { STATE_NAMES } from "@/lib/nigeria";

export const dynamic = "force-dynamic";

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

export async function POST(request: Request) {
  try {
    const b = await request.json();
    if (b.website) return NextResponse.json({ ok: true, ref: "NH-IGNORED" }); // honeypot
    const type = clean(b.type, 20) as RequestType;
    if (!REQUEST_TYPES.includes(type)) return NextResponse.json({ ok: false, error: "Unknown request type." }, { status: 400 });
    const fullName = clean(b.fullName, 80);
    const phone = normalisePhone(clean(b.phone, 20));
    const state = clean(b.state, 30);
    const hospital = clean(b.hospital, 120);
    if (!fullName) return NextResponse.json({ ok: false, error: "Enter the patient's name." }, { status: 400 });
    if (!phone) return NextResponse.json({ ok: false, error: "Enter a valid Nigerian phone number (e.g. 0803 123 4567)." }, { status: 400 });
    if (!STATE_NAMES.includes(state) || !hospital) return NextResponse.json({ ok: false, error: "Choose a state and hospital." }, { status: 400 });
    if (b.consent !== true) return NextResponse.json({ ok: false, error: "Please agree to the health-data notice." }, { status: 400 });

    const urgency = ["ROUTINE", "SOON", "URGENT"].includes(b.urgency) ? b.urgency : "ROUTINE";
    const preferredAt = clean(b.preferredAt, 40);
    const details = clean(b.details, 600);
    const user = await getCurrentUser();

    await ensureHealthTable();
    for (let i = 0; i < 4; i++) {
      const ref = newRef();
      try {
        await db.execute(sql`
          INSERT INTO health_requests (ref, type, state, hospital, full_name, phone, preferred_at, urgency, details, user_id)
          VALUES (${ref}, ${type}, ${state}, ${hospital}, ${fullName}, ${phone}, ${preferredAt}, ${urgency}, ${details}, ${user?.id ?? null})
        `);
        return NextResponse.json({ ok: true, ref, status: "PENDING_CONFIRMATION" });
      } catch (e) {
        if (i === 3) throw e; // ref collision: retry
      }
    }
    return NextResponse.json({ ok: false, error: "Try again." }, { status: 500 });
  } catch (e) {
    console.error("health request error", e);
    return NextResponse.json({ ok: false, error: "Could not save the request. Please call the hospital directly." }, { status: 500 });
  }
}

// Look up a request by reference + phone number (so references can't be guessed by strangers).
export async function GET(request: Request) {
  const u = new URL(request.url);
  const ref = clean(u.searchParams.get("ref"), 20).toUpperCase();
  const phone = normalisePhone(clean(u.searchParams.get("phone"), 20));
  if (!ref || !phone) return NextResponse.json({ ok: false, error: "Enter your reference and phone number." }, { status: 400 });
  try {
    await ensureHealthTable();
    const r = await db.execute(
      sql`SELECT ref, type, hospital, state, urgency, status, created_at FROM health_requests WHERE ref = ${ref} AND phone = ${phone} LIMIT 1`
    );
    if (!r.rows.length) return NextResponse.json({ ok: false, error: "No request found for that reference and phone." }, { status: 404 });
    return NextResponse.json({ ok: true, request: r.rows[0] });
  } catch (e) {
    console.error("health lookup error", e);
    return NextResponse.json({ ok: false, error: "Lookup failed." }, { status: 500 });
  }
}

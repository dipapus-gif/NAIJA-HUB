import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ensurePaymentTables, verifyBlockradar } from "@/lib/payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const s = (v: unknown, max = 200) => (v == null ? null : String(v).slice(0, max));

// Health check so you can open the URL in a browser and see it is live.
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "blockradar-webhook", signingKeyConfigured: !!process.env.BLOCKRADAR_API_KEY });
}

export async function POST(req: Request) {
  const key = process.env.BLOCKRADAR_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: "Webhook not configured" }, { status: 503 });

  const raw = await req.text(); // must be the exact bytes Blockradar signed
  if (raw.length > 200_000) return NextResponse.json({ ok: false }, { status: 413 });
  if (!verifyBlockradar(raw, req.headers.get("x-blockradar-signature"), key)) {
    return NextResponse.json({ ok: false, error: "Bad signature" }, { status: 401 });
  }

  let body: { event?: string; data?: Record<string, unknown> };
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 }); }
  const event = s(body.event, 80);
  const d = body.data ?? {};
  if (!event) return NextResponse.json({ ok: false, error: "No event" }, { status: 400 });

  try {
    await ensurePaymentTables();
    const id = s(d.id) ?? s(d.hash) ?? s(d.reference) ?? "";
    const eventKey = `blockradar:${event}:${id}`;
    // Idempotent: Blockradar retries up to 5 times, so a repeat is acknowledged and ignored.
    await db.execute(sql`
      INSERT INTO payment_events (provider, event_key, event, reference, tx_hash, amount, currency, status, payload)
      VALUES ('blockradar', ${eventKey}, ${event}, ${s(d.reference)}, ${s(d.hash)}, ${s(d.amount, 40)}, ${s(d.currency, 20)}, ${s(d.status, 40)}, ${JSON.stringify(body)}::jsonb)
      ON CONFLICT (event_key) DO NOTHING
    `);
  } catch (e) {
    console.error("blockradar webhook store failed", e);
    return NextResponse.json({ ok: false }, { status: 500 }); // non-200 makes Blockradar retry
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { ensureAjoTables, newCircleCode } from "@/lib/ajo";
import { normalisePhone } from "@/lib/health";

export const dynamic = "force-dynamic";

const clean = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

type Row = Record<string, unknown>;

async function loadCircle(id: number, userId: number) {
  const c = (await db.execute(sql`SELECT * FROM ajo_circles WHERE id = ${id}`)).rows[0] as Row | undefined;
  if (!c) return null;
  const members = (await db.execute(sql`SELECT * FROM ajo_members WHERE circle_id = ${id} ORDER BY position`)).rows as Row[];
  const me = members.find((m) => m.user_id === userId);
  const isOrganiser = c.organiser_id === userId;
  if (!me && !isOrganiser) return null;
  const payments = (await db.execute(sql`SELECT * FROM ajo_payments WHERE circle_id = ${id} ORDER BY round, id`)).rows as Row[];
  const payouts = (await db.execute(sql`SELECT * FROM ajo_payouts WHERE circle_id = ${id} ORDER BY round`)).rows as Row[];
  const round = Number(c.round);
  const count = members.length;
  const collector = count ? members[round % count] : null;
  return {
    id: c.id, code: c.code, name: c.name, amount: c.amount_ngn, frequency: c.frequency, status: c.status, round,
    pool: { bank: c.pool_bank, accountNo: c.pool_acct_no, accountName: c.pool_acct_name },
    isOrganiser, myMemberId: me?.id ?? null,
    collectorId: collector?.id ?? null,
    members: members.map((m) => ({
      id: m.id, name: m.name, position: m.position, hasAccount: m.user_id != null,
      phone: isOrganiser ? m.phone : undefined,
      payoutBank: isOrganiser ? m.payout_bank : undefined,
      payoutAcct: isOrganiser ? m.payout_acct : undefined,
    })),
    payments: payments.map((p) => ({ id: p.id, round: p.round, memberId: p.member_id, amount: p.amount_ngn, reference: p.reference, status: p.status })),
    payouts: payouts.map((p) => ({ round: p.round, memberId: p.member_id, amount: p.amount_ngn, reference: p.reference })),
  };
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in to use Ajo circles.", 401);
  try {
    await ensureAjoTables();
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (id) {
      const c = await loadCircle(id, user.id);
      return c ? NextResponse.json({ ok: true, circle: c }) : fail("Circle not found.", 404);
    }
    const r = await db.execute(sql`
      SELECT c.id, c.name, c.code, c.amount_ngn, c.frequency, c.status, c.round,
        (SELECT COUNT(*) FROM ajo_members m WHERE m.circle_id = c.id) AS members,
        (c.organiser_id = ${user.id}) AS organiser
      FROM ajo_circles c
      WHERE c.organiser_id = ${user.id} OR EXISTS (SELECT 1 FROM ajo_members m WHERE m.circle_id = c.id AND m.user_id = ${user.id})
      ORDER BY c.created_at DESC
    `);
    return NextResponse.json({ ok: true, circles: r.rows });
  } catch (e) {
    console.error("ajo list", e);
    return fail("Could not load circles.", 500);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in to use Ajo circles.", 401);
  try {
    const b = await request.json();
    await ensureAjoTables();
    const action = clean(b.action, 20);

    if (action === "create") {
      const name = clean(b.name, 60);
      const amount = Math.floor(Number(b.amount));
      const bank = clean(b.poolBank, 60);
      const acctNo = clean(b.poolAcctNo, 10);
      const acctName = clean(b.poolAcctName, 80);
      const frequency = b.frequency === "Weekly" ? "Weekly" : "Monthly";
      if (!name) return fail("Give the circle a name.");
      if (!Number.isFinite(amount) || amount < 500 || amount > 50_000_000) return fail("Contribution must be between ₦500 and ₦50,000,000.");
      if (!bank || !/^\d{10}$/.test(acctNo) || !acctName) return fail("Enter the pool account: bank, 10-digit account number and account name.");
      if (b.consent !== true) return fail("Please confirm the notice about how the pool works.");
      for (let i = 0; i < 4; i++) {
        try {
          const code = newCircleCode();
          const res = await db.execute(sql`INSERT INTO ajo_circles (code, name, amount_ngn, frequency, organiser_id, pool_bank, pool_acct_no, pool_acct_name) VALUES (${code}, ${name}, ${amount}, ${frequency}, ${user.id}, ${bank}, ${acctNo}, ${acctName}) RETURNING id`);
          const id = Number((res.rows[0] as Row).id);
          await db.execute(sql`INSERT INTO ajo_members (circle_id, name, user_id, position) VALUES (${id}, ${user.name}, ${user.id}, 0)`);
          return NextResponse.json({ ok: true, id, code });
        } catch (e) {
          if (i === 3) throw e;
        }
      }
    }

    if (action === "join") {
      const code = clean(b.code, 20).toUpperCase();
      const c = (await db.execute(sql`SELECT id, round, status FROM ajo_circles WHERE code = ${code}`)).rows[0] as Row | undefined;
      if (!c) return fail("No circle with that code.", 404);
      if (Number(c.round) > 0 || c.status !== "OPEN") return fail("This circle has already started, so new members can’t join.");
      const id = Number(c.id);
      if ((await db.execute(sql`SELECT 1 FROM ajo_members WHERE circle_id = ${id} AND user_id = ${user.id}`)).rows.length) return fail("You are already in this circle.");
      const phone = normalisePhone(clean(b.phone, 20));
      for (let i = 0; i < 5; i++) {
        try {
          await db.execute(sql`INSERT INTO ajo_members (circle_id, name, phone, user_id, position) VALUES (${id}, ${clean(b.name, 60) || user.name}, ${phone}, ${user.id}, (SELECT COALESCE(MAX(position), -1) + 1 FROM ajo_members WHERE circle_id = ${id}))`);
          return NextResponse.json({ ok: true, id });
        } catch (e) {
          if (i === 4) throw e;
        }
      }
    }

    const id = Math.floor(Number(b.id));
    if (!id) return fail("Missing circle.");
    const c = (await db.execute(sql`SELECT * FROM ajo_circles WHERE id = ${id}`)).rows[0] as Row | undefined;
    if (!c) return fail("Circle not found.", 404);
    const organiser = c.organiser_id === user.id;
    const memberRow = (await db.execute(sql`SELECT * FROM ajo_members WHERE circle_id = ${id} AND user_id = ${user.id}`)).rows[0] as Row | undefined;
    if (!organiser && !memberRow) return fail("You are not in this circle.", 403);
    const round = Number(c.round);
    if (c.status === "COMPLETED") return fail("This circle has finished all its rounds.");

    if (action === "addMember") {
      if (!organiser) return fail("Only the organiser can add members.", 403);
      if (round > 0) return fail("The circle has started, so members can’t be added.");
      const name = clean(b.name, 60);
      if (!name) return fail("Enter the member’s name.");
      await db.execute(sql`INSERT INTO ajo_members (circle_id, name, phone, position) VALUES (${id}, ${name}, ${normalisePhone(clean(b.phone, 20))}, (SELECT COALESCE(MAX(position), -1) + 1 FROM ajo_members WHERE circle_id = ${id}))`);
      return NextResponse.json({ ok: true });
    }

    if (action === "setPayoutAccount") {
      const bank = clean(b.bank, 60);
      const acct = clean(b.acct, 10);
      const mid = Math.floor(Number(b.memberId));
      if (!bank || !/^\d{10}$/.test(acct)) return fail("Enter a bank and a 10-digit account number.");
      const target = (await db.execute(sql`SELECT * FROM ajo_members WHERE id = ${mid} AND circle_id = ${id}`)).rows[0] as Row | undefined;
      if (!target) return fail("Member not found.", 404);
      if (!organiser && target.user_id !== user.id) return fail("You can only set your own payout account.", 403);
      await db.execute(sql`UPDATE ajo_members SET payout_bank = ${bank}, payout_acct = ${acct} WHERE id = ${mid}`);
      return NextResponse.json({ ok: true });
    }

    if (action === "report") {
      const mid = organiser && b.memberId ? Math.floor(Number(b.memberId)) : Number(memberRow?.id);
      const ref = clean(b.reference, 60);
      if (!mid) return fail("Member not found.");
      if (!ref) return fail("Enter the transfer reference or the name/time shown on your transfer receipt.");
      const own = (await db.execute(sql`SELECT 1 FROM ajo_members WHERE id = ${mid} AND circle_id = ${id}`)).rows.length;
      if (!own) return fail("Member not found.", 404);
      const ex = (await db.execute(sql`SELECT status FROM ajo_payments WHERE circle_id = ${id} AND round = ${round} AND member_id = ${mid}`)).rows[0] as Row | undefined;
      if (ex?.status === "CONFIRMED") return fail("This payment is already confirmed.");
      await db.execute(sql`
        INSERT INTO ajo_payments (circle_id, round, member_id, amount_ngn, reference) VALUES (${id}, ${round}, ${mid}, ${c.amount_ngn as number}, ${ref})
        ON CONFLICT (circle_id, round, member_id) DO UPDATE SET reference = EXCLUDED.reference, status = 'REPORTED'
      `);
      return NextResponse.json({ ok: true });
    }

    if (action === "confirm" || action === "reject") {
      if (!organiser) return fail("Only the organiser can confirm payments.", 403);
      const pid = Math.floor(Number(b.paymentId));
      const r = await db.execute(sql`UPDATE ajo_payments SET status = ${action === "confirm" ? "CONFIRMED" : "REJECTED"}, confirmed_at = NOW() WHERE id = ${pid} AND circle_id = ${id} AND round = ${round} RETURNING id`);
      return r.rows.length ? NextResponse.json({ ok: true }) : fail("Payment not found for this round.", 404);
    }

    if (action === "payout") {
      if (!organiser) return fail("Only the organiser can record a payout.", 403);
      const ref = clean(b.reference, 60);
      if (!ref) return fail("Enter the transfer reference of the payout you made.");
      const result = await db.transaction(async (tx) => {
        const members = (await tx.execute(sql`SELECT id, name FROM ajo_members WHERE circle_id = ${id} ORDER BY position FOR UPDATE`)).rows as Row[];
        if (members.length < 2) return "A circle needs at least 2 members.";
        const cur = (await tx.execute(sql`SELECT round FROM ajo_circles WHERE id = ${id} FOR UPDATE`)).rows[0] as Row;
        const rnd = Number(cur.round);
        const paid = (await tx.execute(sql`SELECT COUNT(*)::int AS n FROM ajo_payments WHERE circle_id = ${id} AND round = ${rnd} AND status = 'CONFIRMED'`)).rows[0] as Row;
        if (Number(paid.n) < members.length) return `Not everyone has paid yet: ${paid.n} of ${members.length} confirmed.`;
        const collector = members[rnd % members.length];
        const total = (c.amount_ngn as number) * members.length;
        await tx.execute(sql`INSERT INTO ajo_payouts (circle_id, round, member_id, amount_ngn, reference) VALUES (${id}, ${rnd}, ${collector.id as number}, ${total}, ${ref})`);
        const next = rnd + 1;
        await tx.execute(sql`UPDATE ajo_circles SET round = ${next}, status = ${next >= members.length ? "COMPLETED" : "ACTIVE"} WHERE id = ${id}`);
        return null;
      });
      return result ? fail(result) : NextResponse.json({ ok: true });
    }

    return fail("Unknown action.");
  } catch (e) {
    console.error("ajo post", e);
    return fail("Something went wrong. Please try again.", 500);
  }
}

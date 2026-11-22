import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  crowdPrices,
  nafdacProducts,
  nepaReports,
  transitRoutes,
} from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

let initialized = false;

async function ensureTablesAndSeed() {
  if (initialized) return;

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nepa_reports (
      id SERIAL PRIMARY KEY,
      city TEXT NOT NULL,
      area TEXT NOT NULL,
      street TEXT NOT NULL,
      disco TEXT NOT NULL,
      band TEXT NOT NULL DEFAULT 'Band B',
      status TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      reported_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS crowd_prices (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      item_name TEXT NOT NULL,
      unit TEXT NOT NULL,
      location TEXT NOT NULL,
      city TEXT NOT NULL,
      price_ngn INTEGER NOT NULL,
      previous_price_ngn INTEGER NOT NULL,
      reported_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS transit_routes (
      id SERIAL PRIMARY KEY,
      city TEXT NOT NULL,
      mode TEXT NOT NULL,
      from_stop TEXT NOT NULL,
      to_stop TEXT NOT NULL,
      fare_min_ngn INTEGER NOT NULL,
      fare_max_ngn INTEGER NOT NULL,
      alert_level TEXT NOT NULL DEFAULT 'CLEAR',
      alert_note TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nafdac_products (
      id SERIAL PRIMARY KEY,
      reg_number TEXT NOT NULL,
      product_name TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      guidance TEXT NOT NULL
    );
  `);

  const existingNepa = await db.select().from(nepaReports).limit(1);
  if (existingNepa.length === 0) {
    await db.insert(nepaReports).values([
      {
        city: "Lagos",
        area: "Surulere",
        street: "Adelabu Street & Bode Thomas",
        disco: "EKEDC",
        band: "Band A",
        status: "ON",
        note: "Up NEPA! Full voltage 226V restored 40 mins ago.",
      },
      {
        city: "Lagos",
        area: "Ikeja / Maryland",
        street: "Ikorodu Rd Service Lane",
        disco: "IKEDC",
        band: "Band A",
        status: "ON",
        note: "Steady grid light since morning.",
      },
      {
        city: "Abuja",
        area: "Wuse 2",
        street: "Aminu Kano Crescent",
        disco: "AEDC",
        band: "Band A",
        status: "LOW_VOLTAGE",
        note: "Phase fluctuation — keep AC on stabilizer.",
      },
      {
        city: "Port Harcourt",
        area: "D-Line / Garrison",
        street: "Olu Obasanjo Road",
        disco: "PHED",
        band: "Band B",
        status: "OFF",
        note: "Feeder tripped during afternoon rainstorm.",
      },
      {
        city: "Kano",
        area: "Sabon Gari",
        street: "France Road Market Axis",
        disco: "KEDCO",
        band: "Band B",
        status: "ON",
        note: "Light restored for evening shops.",
      },
    ]);
  }

  const existingPrices = await db.select().from(crowdPrices).limit(1);
  if (existingPrices.length === 0) {
    await db.insert(crowdPrices).values([
      {
        category: "FUEL",
        itemName: "PMS Petrol",
        unit: "per Litre",
        location: "NNPC Mega Station, Berger",
        city: "Lagos",
        priceNgn: 995,
        previousPriceNgn: 1030,
      },
      {
        category: "FUEL",
        itemName: "AGO Diesel",
        unit: "per Litre",
        location: "TotalEnergies Central Area",
        city: "Abuja",
        priceNgn: 1380,
        previousPriceNgn: 1410,
      },
      {
        category: "FUEL",
        itemName: "Cooking Gas (LPG)",
        unit: "12.5kg Refill",
        location: "Trans-Amadi Gas Plant",
        city: "Port Harcourt",
        priceNgn: 16200,
        previousPriceNgn: 15600,
      },
      {
        category: "STAPLE",
        itemName: "Local Destoned Rice",
        unit: "50kg Bag",
        location: "Dawanau / Mile 12 Wholesale",
        city: "Kano",
        priceNgn: 76500,
        previousPriceNgn: 79000,
      },
      {
        category: "STAPLE",
        itemName: "Yellow Garri (Ijebu)",
        unit: "Paint Bucket (4L)",
        location: "Mile 12 Market",
        city: "Lagos",
        priceNgn: 3500,
        previousPriceNgn: 3800,
      },
      {
        category: "STAPLE",
        itemName: "Honey Beans (Oloyin)",
        unit: "Paint Bucket (4L)",
        location: "Wuse Market",
        city: "Abuja",
        priceNgn: 7200,
        previousPriceNgn: 6800,
      },
    ]);
  }

  const existingTransit = await db.select().from(transitRoutes).limit(1);
  if (existingTransit.length === 0) {
    await db.insert(transitRoutes).values([
      {
        city: "Lagos",
        mode: "Danfo",
        fromStop: "Oshodi Bus Terminal",
        toStop: "CMS / Marina",
        fareMinNgn: 800,
        fareMaxNgn: 1200,
        alertLevel: "TRAFFIC",
        alertNote: "Slow inward movement approaching Carter / Adeniji ramp.",
      },
      {
        city: "Lagos",
        mode: "BRT",
        fromStop: "Ikorodu Garage",
        toStop: "TBS / Victoria Island",
        fareMinNgn: 900,
        fareMaxNgn: 1150,
        alertLevel: "CLEAR",
        alertNote: "Dedicated lane moving cleanly; Cowry card active.",
      },
      {
        city: "Lagos",
        mode: "Danfo",
        fromStop: "Lekki Phase 1 Gate",
        toStop: "Ajah / Sangotedo",
        fareMinNgn: 600,
        fareMaxNgn: 900,
        alertLevel: "FLOOD",
        alertNote: "Surface water flash alert near Jakande / Chisco after rain.",
      },
      {
        city: "Abuja",
        mode: "Bus / Along",
        fromStop: "Berger Roundabout",
        toStop: "Wuse Market / Area 1",
        fareMinNgn: 400,
        fareMaxNgn: 600,
        alertLevel: "CLEAR",
        alertNote: "Expressway clear; standard 'along' shared taxi active.",
      },
      {
        city: "Abuja",
        mode: "Keke",
        fromStop: "Gwarinpa 1st Avenue",
        toStop: "6th Avenue / Charley Boy",
        fareMinNgn: 250,
        fareMaxNgn: 400,
        alertLevel: "CLEAR",
        alertNote: "Internal estate Keke operating smoothly.",
      },
      {
        city: "Port Harcourt",
        mode: "Bus",
        fromStop: "Rumuokoro Flyover",
        toStop: "Waterlines / GRA Junction",
        fareMinNgn: 400,
        fareMaxNgn: 600,
        alertLevel: "TRAFFIC",
        alertNote: "Moderate evening build-up along Aba Road.",
      },
      {
        city: "Port Harcourt",
        mode: "Keke",
        fromStop: "Choba Junction",
        toStop: "UniPort Main Gate",
        fareMinNgn: 200,
        fareMaxNgn: 300,
        alertLevel: "FLOOD",
        alertNote: "Puddles along East-West slip lane; riders taking inner street.",
      },
      {
        city: "Kano",
        mode: "Keke (Adaidaita Sahu)",
        fromStop: "Bata / Kwari Market",
        toStop: "Sabon Gari Market",
        fareMinNgn: 250,
        fareMaxNgn: 400,
        alertLevel: "CLEAR",
        alertNote: "Brisk commercial traffic; standard fare steady.",
      },
      {
        city: "Kano",
        mode: "Bus / Keke",
        fromStop: "Zoo Road",
        toStop: "BUK New Site",
        fareMinNgn: 350,
        fareMaxNgn: 500,
        alertLevel: "CLEAR",
        alertNote: "Smooth corridor along Gwarzo Road.",
      },
    ]);
  }

  const existingNafdac = await db.select().from(nafdacProducts).limit(1);
  if (existingNafdac.length === 0) {
    await db.insert(nafdacProducts).values([
      {
        regNumber: "A4-1234",
        productName: "Lonart DS (Artemether 80mg / Lumefantrine 480mg)",
        manufacturer: "Greenlife Pharmaceuticals Ltd",
        category: "Antimalarial Medicine",
        status: "VERIFIED",
        guidance:
          "Registered & genuine NAFDAC Greenbook entry. Always scratch & SMS Mobile Authentication Service (MAS) PIN to 38353.",
      },
      {
        regNumber: "04-0192",
        productName: "Emzor Paracetamol 500mg Caplets",
        manufacturer: "Emzor Pharmaceutical Industries Ltd, Lagos",
        category: "Analgesic",
        status: "VERIFIED",
        guidance:
          "Active registration. Confirm blister foil embossing and expiry stamp.",
      },
      {
        regNumber: "01-0844",
        productName: "Eva Premium Table Water (75cl / 150cl)",
        manufacturer: "Nigerian Bottling Company Ltd",
        category: "Packaged Water",
        status: "VERIFIED",
        guidance:
          "Registered packaged water. Ensure neck tamper seal clicks cleanly.",
      },
      {
        regNumber: "A7-4019",
        productName: "Peak Full Cream Instant Milk Powder (400g)",
        manufacturer: "FrieslandCampina WAMCO Nigeria PLC",
        category: "Food & Dairy",
        status: "VERIFIED",
        guidance: "Registered food product in good standing.",
      },
      {
        regNumber: "B1-9999",
        productName: "Unregistered Street Herbal Bitters Batch X9",
        manufacturer: "Unlisted / Cloned Label",
        category: "Herbal / Spirits",
        status: "RECALLED",
        guidance:
          "DANGER: Flagged fake registration number. Do NOT consume — report vendor to nearest NAFDAC office or dial 112.",
      },
    ]);
  }

  initialized = true;
}

export async function GET(request: Request) {
  try {
    await ensureTablesAndSeed();
    const { searchParams } = new URL(request.url);
    const nafdacQuery = searchParams.get("nafdac")?.trim().toUpperCase();

    if (nafdacQuery) {
      const found = await db
        .select()
        .from(nafdacProducts)
        .where(eq(nafdacProducts.regNumber, nafdacQuery))
        .limit(1);

      return NextResponse.json({
        ok: true,
        query: nafdacQuery,
        product: found[0] ?? null,
      });
    }

    const [nepa, prices, transit, nafdac] = await Promise.all([
      db.select().from(nepaReports).orderBy(desc(nepaReports.reportedAt)).limit(12),
      db.select().from(crowdPrices).orderBy(desc(crowdPrices.reportedAt)).limit(12),
      db.select().from(transitRoutes).orderBy(desc(transitRoutes.updatedAt)).limit(20),
      db.select().from(nafdacProducts).limit(10),
    ]);

    return NextResponse.json({
      ok: true,
      nepa,
      prices,
      transit,
      nafdac,
      referenceRates: {
        USD: 1595,
        GBP: 2048,
        EUR: 1720,
        updatedLabel: "NAFEM Official Reference Window",
      },
    });
  } catch (error) {
    console.error("GET /api/community error:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to load community feed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureTablesAndSeed();
    const body = await request.json();

    if (body.type === "NEPA_REPORT") {
      const city = String(body.city || "Lagos").slice(0, 50);
      const area = String(body.area || "").trim().slice(0, 80);
      const street = String(body.street || "").trim().slice(0, 120);
      const disco = String(body.disco || "IKEDC").slice(0, 20);
      const band = String(body.band || "Band B").slice(0, 20);
      const status = ["ON", "OFF", "LOW_VOLTAGE"].includes(body.status)
        ? body.status
        : "ON";
      const note = String(body.note || "").trim().slice(0, 180);

      if (!area || !street) {
        return NextResponse.json(
          { ok: false, error: "Area and street are required" },
          { status: 400 }
        );
      }

      const [inserted] = await db
        .insert(nepaReports)
        .values({ city, area, street, disco, band, status, note })
        .returning();

      return NextResponse.json({ ok: true, item: inserted });
    }

    if (body.type === "PRICE_REPORT") {
      const category = body.category === "FUEL" ? "FUEL" : "STAPLE";
      const itemName = String(body.itemName || "").trim().slice(0, 80);
      const unit = String(body.unit || "Standard Unit").trim().slice(0, 40);
      const location = String(body.location || "").trim().slice(0, 100);
      const city = String(body.city || "Lagos").trim().slice(0, 40);
      const priceNgn = Math.max(50, Math.round(Number(body.priceNgn) || 0));
      const previousPriceNgn = Math.max(
        50,
        Math.round(Number(body.previousPriceNgn) || priceNgn)
      );

      if (!itemName || !location) {
        return NextResponse.json(
          { ok: false, error: "Item and station/market are required" },
          { status: 400 }
        );
      }

      const [inserted] = await db
        .insert(crowdPrices)
        .values({
          category,
          itemName,
          unit,
          location,
          city,
          priceNgn,
          previousPriceNgn,
        })
        .returning();

      return NextResponse.json({ ok: true, item: inserted });
    }

    if (body.type === "TRANSIT_REPORT") {
      const city = String(body.city || "Lagos").slice(0, 40);
      const mode = String(body.mode || "Danfo").slice(0, 30);
      const fromStop = String(body.fromStop || "").trim().slice(0, 80);
      const toStop = String(body.toStop || "").trim().slice(0, 80);
      const fareMinNgn = Math.max(100, Math.round(Number(body.fareMinNgn) || 300));
      const fareMaxNgn = Math.max(
        fareMinNgn,
        Math.round(Number(body.fareMaxNgn) || fareMinNgn + 200)
      );
      const alertLevel = ["CLEAR", "TRAFFIC", "FLOOD"].includes(body.alertLevel)
        ? body.alertLevel
        : "CLEAR";
      const alertNote = String(body.alertNote || "").trim().slice(0, 160);

      if (!fromStop || !toStop) {
        return NextResponse.json(
          { ok: false, error: "Origin and destination stops are required" },
          { status: 400 }
        );
      }

      const [inserted] = await db
        .insert(transitRoutes)
        .values({
          city,
          mode,
          fromStop,
          toStop,
          fareMinNgn,
          fareMaxNgn,
          alertLevel,
          alertNote,
        })
        .returning();

      return NextResponse.json({ ok: true, item: inserted });
    }

    return NextResponse.json(
      { ok: false, error: "Unsupported report type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/community error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to save report" },
      { status: 500 }
    );
  }
}

import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const nepaReports = pgTable("nepa_reports", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(),
  area: text("area").notNull(),
  street: text("street").notNull(),
  disco: text("disco").notNull(),
  band: text("band").notNull().default("Band B"),
  status: text("status").notNull(), // "ON" | "OFF" | "LOW_VOLTAGE"
  note: text("note").notNull().default(""),
  reportedAt: timestamp("reported_at").defaultNow().notNull(),
});

export const crowdPrices = pgTable("crowd_prices", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // "FUEL" | "STAPLE"
  itemName: text("item_name").notNull(), // e.g. "PMS Petrol", "AGO Diesel", "Cooking Gas (12.5kg)", "Local Rice (50kg)", "Yellow Garri (Paint)", "Honey Beans (Paint)"
  unit: text("unit").notNull(), // e.g. "per Litre", "12.5kg Cylinder", "50kg Bag", "Paint Bucket (4L)"
  location: text("location").notNull(), // Station or Market name
  city: text("city").notNull(),
  priceNgn: integer("price_ngn").notNull(),
  previousPriceNgn: integer("previous_price_ngn").notNull(),
  reportedAt: timestamp("reported_at").defaultNow().notNull(),
});

export const transitRoutes = pgTable("transit_routes", {
  id: serial("id").primaryKey(),
  city: text("city").notNull(), // "Lagos" | "Abuja" | "Port Harcourt" | "Kano"
  mode: text("mode").notNull(), // "Danfo" | "BRT" | "Keke" | "Taxi / Drop"
  fromStop: text("from_stop").notNull(),
  toStop: text("to_stop").notNull(),
  fareMinNgn: integer("fare_min_ngn").notNull(),
  fareMaxNgn: integer("fare_max_ngn").notNull(),
  alertLevel: text("alert_level").notNull().default("CLEAR"), // "CLEAR" | "TRAFFIC" | "FLOOD"
  alertNote: text("alert_note").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const nafdacProducts = pgTable("nafdac_products", {
  id: serial("id").primaryKey(),
  regNumber: text("reg_number").notNull(),
  productName: text("product_name").notNull(),
  manufacturer: text("manufacturer").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull(), // "VERIFIED" | "RECALLED" | "UNVERIFIED_ALERT"
  guidance: text("guidance").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

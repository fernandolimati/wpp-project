import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  real,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core"

// --- Tenants ---
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 50 }).default("trial").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

// --- Users ---
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 20 }).default("member").notNull(),
  supabase_uid: uuid("supabase_uid").unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
})

// --- Contacts ---
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  first_name: varchar("first_name", { length: 100 }).notNull(),
  last_name: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  lead_score: integer("lead_score").default(0).notNull(),
  preferences: jsonb("preferences"),
  whatsapp_jid: varchar("whatsapp_jid", { length: 100 }),
  source: varchar("source", { length: 50 }).default("manual"),
  archived: boolean("archived").default(false).notNull(),
  version: integer("version").default(1).notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// --- Deals ---
export const deals = pgTable("deals", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  contact_id: uuid("contact_id").references(() => contacts.id),
  title: varchar("title", { length: 255 }).notNull(),
  stage: varchar("stage", { length: 50 }).default("lead").notNull(),
  value: real("value").default(0).notNull(),
  expected_close: timestamp("expected_close"),
  assigned_to: uuid("assigned_to").references(() => users.id),
  notes: text("notes"),
  version: integer("version").default(1).notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// --- Activities ---
export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  contact_id: uuid("contact_id").references(() => contacts.id),
  deal_id: uuid("deal_id").references(() => deals.id),
  user_id: uuid("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  version: integer("version").default(1).notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// --- Quotes ---
export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  deal_id: uuid("deal_id").references(() => deals.id),
  legs: jsonb("legs").notNull(),
  line_items: jsonb("line_items").notNull(),
  tax_amount: real("tax_amount").default(0).notNull(),
  subtotal: real("subtotal").default(0).notNull(),
  total: real("total").default(0).notNull(),
  valid_until: timestamp("valid_until"),
  pdf_url: text("pdf_url"),
  version: integer("version").default(1).notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// --- AI Reports ---
export const aiReports = pgTable("ai_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenant_id: uuid("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  user_id: uuid("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  content: jsonb("content").notNull(),
  version: integer("version").default(1).notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

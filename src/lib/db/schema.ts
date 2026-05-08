import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  jsonb,
  real,
  index,
  uniqueIndex,
  vector,
} from "drizzle-orm/pg-core";
import type { PersonaKernel } from "@/lib/persona/schema";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  username: text("username"),
  display_name: text("display_name"),
  avatar_url: text("avatar_url"),
  quiet_hours: jsonb("quiet_hours").$type<{
    start: string;
    end: string;
    tz: string;
  } | null>(),
  notification_budget_per_day: integer("notification_budget_per_day").default(20),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shapes = pgTable(
  "shapes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    display_name: text("display_name").notNull(),
    avatar_url: text("avatar_url"),
    creator_id: text("creator_id").references(() => users.id),
    persona_kernel: jsonb("persona_kernel").notNull().$type<PersonaKernel>(),
    is_public: boolean("is_public").default(false),
    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => [index("shapes_slug_idx").on(t.slug)]
);

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  owner_id: text("owner_id").references(() => users.id),
  invite_code: text("invite_code").unique(),
  mode: text("mode").notNull().default("casual"),
  prevent_engine_override: boolean("prevent_engine_override").default(false),
  free_will_enabled: boolean("free_will_enabled").default(true),
  daily_token_budget: integer("daily_token_budget").default(500_000),
  daily_tokens_used: integer("daily_tokens_used").default(0),
  daily_tokens_reset_at: timestamp("daily_tokens_reset_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
});

export const room_members = pgTable(
  "room_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    room_id: uuid("room_id")
      .references(() => rooms.id)
      .notNull(),
    user_id: text("user_id").references(() => users.id),
    shape_id: uuid("shape_id").references(() => shapes.id),
    role: text("role").notNull().default("member"),
    joined_at: timestamp("joined_at").defaultNow(),
  },
  (t) => [index("room_members_room_idx").on(t.room_id)]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    room_id: uuid("room_id")
      .references(() => rooms.id)
      .notNull(),
    sender_user_id: text("sender_user_id").references(() => users.id),
    sender_shape_id: uuid("sender_shape_id").references(() => shapes.id),
    content: text("content").notNull(),
    addressing: text("addressing"),
    strategy: text("strategy"),
    reply_to_message_id: uuid("reply_to_message_id"),
    director_run_id: uuid("director_run_id"),
    tokens_used: integer("tokens_used"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at"),
    is_edited: boolean("is_edited").default(false),
  },
  (t) => [index("messages_room_created_idx").on(t.room_id, t.created_at)]
);

export const director_runs = pgTable(
  "director_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    room_id: uuid("room_id")
      .references(() => rooms.id)
      .notNull(),
    trigger_event: text("trigger_event").notNull(),
    trigger_message_id: uuid("trigger_message_id"),
    decision: jsonb("decision").notNull(),
    skip_reason: text("skip_reason"),
    prefilter_decision: text("prefilter_decision"),
    latency_ms: integer("latency_ms"),
    tokens_used: integer("tokens_used"),
    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => [index("director_runs_room_created_idx").on(t.room_id, t.created_at)]
);

export const memories = pgTable(
  "memories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shape_id: uuid("shape_id")
      .references(() => shapes.id)
      .notNull(),
    user_id: text("user_id")
      .references(() => users.id)
      .notNull(),
    room_id: uuid("room_id").references(() => rooms.id),
    scope: text("scope").notNull().default("private"),
    type: text("type").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata"),
    embedding: vector("embedding", { dimensions: 1536 }),
    created_at: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("memories_embedding_idx").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops")
    ),
    index("memories_scope_idx").on(t.shape_id, t.user_id, t.scope),
  ]
);

export const user_memories = pgTable(
  "user_memories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shape_id: uuid("shape_id").references(() => shapes.id).notNull(),
    user_id: text("user_id").references(() => users.id).notNull(),
    profile: text("profile").notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("user_memories_shape_user_idx").on(t.shape_id, t.user_id),
  ]
);

export const shape_state = pgTable(
  "shape_state",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shape_id: uuid("shape_id")
      .references(() => shapes.id)
      .notNull(),
    room_id: uuid("room_id")
      .references(() => rooms.id)
      .notNull(),
    last_spoke_at: timestamp("last_spoke_at"),
    messages_this_hour: integer("messages_this_hour").default(0),
    hour_window_start: timestamp("hour_window_start"),
    cooldown_until: timestamp("cooldown_until"),
  },
  (t) => [index("shape_state_shape_room_idx").on(t.shape_id, t.room_id)]
);

// Better Auth requires these tables
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Shape = typeof shapes.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type RoomMember = typeof room_members.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type DirectorRun = typeof director_runs.$inferSelect;
export type Memory = typeof memories.$inferSelect;
export type ShapeState = typeof shape_state.$inferSelect;

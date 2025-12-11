import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, serial, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  roleId: integer("role_id").notNull().references(() => roles.id).default(2),
  points: integer("points").notNull().default(0),
  email: text("email"),
  whatsapp: text("whatsapp"),
});

export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull(),
});

export const difficulties = pgTable("difficulties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const requestStatuses = pgTable("request_statuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  serverId: integer("server_id").notNull().references(() => servers.id),
  name: text("name").notNull(),
  vocation: text("vocation"),
  level: integer("level").notNull().default(1),
  isMain: boolean("is_main").notNull().default(false),
  isExternal: boolean("is_external").notNull().default(false),
  externalVerifiedAt: timestamp("external_verified_at"),
});

export const respawns = pgTable("respawns", {
  id: serial("id").primaryKey(),
  serverId: integer("server_id").notNull().references(() => servers.id),
  name: text("name").notNull(),
  difficultyId: integer("difficulty_id").notNull().references(() => difficulties.id),
  minPlayers: integer("min_players").notNull().default(1),
  maxPlayers: integer("max_players").notNull().default(4),
});

export const slots = pgTable("slots", {
  id: serial("id").primaryKey(),
  serverId: integer("server_id").notNull().references(() => servers.id),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
});

export const schedulePeriods = pgTable("schedule_periods", {
  id: serial("id").primaryKey(),
  serverId: integer("server_id").notNull().references(() => servers.id),
  name: text("name").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  serverId: integer("server_id").notNull().references(() => servers.id),
  respawnId: integer("respawn_id").notNull().references(() => respawns.id),
  slotId: integer("slot_id").notNull().references(() => slots.id),
  periodId: integer("period_id").notNull().references(() => schedulePeriods.id),
  statusId: integer("status_id").notNull().references(() => requestStatuses.id).default(1),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const requestPartyMembers = pgTable("request_party_members", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => requests.id, { onDelete: 'cascade' }),
  characterId: integer("character_id").references(() => characters.id),
  characterName: text("character_name"),
  roleInParty: text("role_in_party"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true });
export const insertServerSchema = createInsertSchema(servers).omit({ id: true });
export const insertDifficultySchema = createInsertSchema(difficulties).omit({ id: true });
export const insertRequestStatusSchema = createInsertSchema(requestStatuses).omit({ id: true });
export const insertCharacterSchema = createInsertSchema(characters).omit({ id: true });
export const insertRespawnSchema = createInsertSchema(respawns).omit({ id: true });
export const insertSlotSchema = createInsertSchema(slots).omit({ id: true });
export const insertSchedulePeriodSchema = createInsertSchema(schedulePeriods).omit({ id: true });
export const insertRequestSchema = createInsertSchema(requests).omit({ id: true, createdAt: true });
export const insertRequestPartyMemberSchema = createInsertSchema(requestPartyMembers).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Server = typeof servers.$inferSelect;
export type Difficulty = typeof difficulties.$inferSelect;
export type RequestStatus = typeof requestStatuses.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type Respawn = typeof respawns.$inferSelect;
export type Slot = typeof slots.$inferSelect;
export type SchedulePeriod = typeof schedulePeriods.$inferSelect;
export type Request = typeof requests.$inferSelect;
export type RequestPartyMember = typeof requestPartyMembers.$inferSelect;

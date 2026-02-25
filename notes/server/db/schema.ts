import { integer, timestamp } from "drizzle-orm/pg-core";
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendees = pgTable("attendees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  eventId: integer("event_id").references(() => events.id).notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userName: text("userName").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  attendeeId: integer("attendee_id").references(() => attendees.id).notNull(),
});



export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Attendee = typeof attendees.$inferSelect;
export type NewAttendee = typeof attendees.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

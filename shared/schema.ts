import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  distance: decimal("distance", { precision: 8, scale: 2 }).notNull(),
  estimatedDuration: integer("estimated_duration").notNull(), // in minutes
  stops: jsonb("stops").$type<string[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const buses = pgTable("buses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: text("number").notNull().unique(),
  operator: text("operator").notNull(),
  capacity: integer("capacity").notNull(),
  amenities: jsonb("amenities").$type<string[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  busId: varchar("bus_id").references(() => buses.id).notNull(),
  routeId: varchar("route_id").references(() => routes.id).notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  availableSeats: integer("available_seats").notNull(),
  status: text("status").default("scheduled").notNull(), // scheduled, in_progress, completed, cancelled
  isOptimized: boolean("is_optimized").default(false).notNull(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  scheduleId: varchar("schedule_id").references(() => schedules.id).notNull(),
  seatNumbers: jsonb("seat_numbers").$type<string[]>().notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("confirmed").notNull(), // confirmed, cancelled, completed
  passengerDetails: jsonb("passenger_details").$type<{
    name: string;
    phone: string;
    email: string;
  }>().notNull(),
  paymentStatus: text("payment_status").default("completed").notNull(), // pending, completed, failed
  bookedAt: timestamp("booked_at").defaultNow().notNull(),
});

export const busLocations = pgTable("bus_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  busId: varchar("bus_id").references(() => buses.id).notNull(),
  scheduleId: varchar("schedule_id").references(() => schedules.id),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  currentStop: text("current_stop"),
  occupancy: integer("occupancy").default(0).notNull(),
  delay: integer("delay").default(0).notNull(), // in minutes
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const demandPredictions = pgTable("demand_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  routeId: varchar("route_id").references(() => routes.id).notNull(),
  date: timestamp("date").notNull(),
  hour: integer("hour").notNull(),
  predictedDemand: integer("predicted_demand").notNull(),
  actualDemand: integer("actual_demand"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
});

export const insertBusSchema = createInsertSchema(buses).omit({
  id: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookedAt: true,
});

export const insertBusLocationSchema = createInsertSchema(busLocations).omit({
  id: true,
  updatedAt: true,
});

export const insertDemandPredictionSchema = createInsertSchema(demandPredictions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type Bus = typeof buses.$inferSelect;
export type InsertBus = z.infer<typeof insertBusSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type BusLocation = typeof busLocations.$inferSelect;
export type InsertBusLocation = z.infer<typeof insertBusLocationSchema>;

export type DemandPrediction = typeof demandPredictions.$inferSelect;
export type InsertDemandPrediction = z.infer<typeof insertDemandPredictionSchema>;

// Extended types for API responses
export type ScheduleWithDetails = Schedule & {
  bus: Bus;
  route: Route;
};

export type BookingWithDetails = Booking & {
  schedule: ScheduleWithDetails;
};

export type BusWithLocation = Bus & {
  location?: BusLocation;
};

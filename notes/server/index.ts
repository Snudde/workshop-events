import express from "express";
import cors from "cors";
import { eq, and } from "drizzle-orm";
import { db } from "./db/db.js";
import { events, attendees, users, type Event, type NewEvent, type Attendee, type NewAttendee, type User, type NewUser } from "./db/schema.js";

// Att göra
// 1. koppla drizzle till pool
// 2. skapa ett schema av tabellerna
// 3. byta pool.query till db queries med drizzle

// Helper function to format timestamps (handles Date or string)
const toDate = (v: Date | string) => (v instanceof Date ? v : new Date(v));
const formatEvent = (event: Event) => ({
  ...event,
  date: toDate(event.date).toISOString().split('T')[0],
  createdAt: toDate(event.createdAt).toISOString().split('T')[0],
});

// Skapa express app och lägg till middleware
const app = express();
app.use(cors());
app.use(express.json());

// Routes

// GET all events
app.get("/events", async (req, res) => {
  const result: Event[] = await db.select().from(events);
  res.json(result.map(formatEvent));
});

// GET a single event by ID
app.get("/events/:id", async (req, res) => {
  const { id } = req.params;
  const result: Event[] = await db.select().from(events).where(eq(events.id, parseInt(id)));
  
  if (result.length === 0) {
    return res.status(404).json({ error: "Event not found" });
  }

  res.json(formatEvent(result[0]));
});

// POST - create a new event
app.post("/events", async (req, res) => {
  const { title, location, date } = req.body;
  
  const newEvent: NewEvent = {
    title,
    location,
    date: new Date(date),
  };

  const created: Event[] = await db.insert(events).values(newEvent).returning();
  res.status(201).json(formatEvent(created[0]));
});


// PATCH - update an existing event
app.patch("/events/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const { title, location } = req.body;
  const updatedEvent: Partial<Event> = {

    location,
    title,
    
  };

  const updated: Event[] = await db.update(events).set(updatedEvent).where(eq(events.id, parseInt(eventId))).returning();
  res.json(formatEvent(updated[0]));
});

app.get("/events/:eventId/attendees", async (req, res) => {
  const { eventId } = req.params;
  const result: Attendee[] = await db.select().from(attendees).where(eq(attendees.eventId, parseInt(eventId)));
  res.json(result);
});

// POST - add an attendee to an event
app.post("/events/:eventId/attendees", async (req, res) => {
  const { eventId } = req.params;
  const { name, email } = req.body;

  const newAttendee: NewAttendee = {
    name,
    email,
    eventId: parseInt(eventId),
  };

  const created: Attendee[] = await db.insert(attendees).values(newAttendee).returning();
  res.status(201).json(created[0]);
});

// GET all users
app.get("/users", async (req, res) => {
  const result: User[] = await db.select().from(users);
  res.json(result);
});

// GET all attendees
app.get("/attendees", async (req, res) => {
  const result: Attendee[] = await db.select().from(attendees);
  res.json(result);
});

app.post("/attendees", async (req, res) => {
  const { name, email, eventId } = req.body;
  const newAttendee: NewAttendee = {
    name,
    email,
    eventId,
  };

  const created: Attendee[] = await db.insert(attendees).values(newAttendee).returning();
  res.status(201).json(created[0]);
});

// POST user
app.post("/users", async (req, res) => {
  const { userName, email, attendeeId } = req.body;
  const newUser: NewUser = {
    userName,
    email,
    attendeeId,
  };

  const created: User[] = await db.insert(users).values(newUser).returning();
  res.status(201).json(created[0]);
});

// POST - add an attendee to an event
app.post("/attendees/:attendeeId/users", async (req, res) => {
  const { attendeeId } = req.params;
  const { userName, email } = req.body;

  const newUser: NewUser = {
    userName,
    email,
    attendeeId: parseInt(attendeeId),
  };

  const created: User[] = await db.insert(users).values(newUser).returning();
  res.status(201).json(created[0]);
});

// POST - add a user to an attendee within a specific event (verifies attendee belongs to event)
app.post("/events/:eventId/attendees/:attendeeId/users", async (req, res) => {
  const { eventId, attendeeId } = req.params;
  const { userName, email } = req.body;

  // verify attendee belongs to the event
  const found = await db
    .select()
    .from(attendees)
    .where(and(eq(attendees.id, parseInt(attendeeId)), eq(attendees.eventId, parseInt(eventId))));

  if (found.length === 0) {
    return res.status(404).json({ error: "Attendee not found for the given event" });
  }

  const newUser: NewUser = {
    userName,
    email,
    attendeeId: parseInt(attendeeId),
  };

  const created: User[] = await db.insert(users).values(newUser).returning();
  res.status(201).json(created[0]);
});

app.listen(3001, () => {
  console.log("Listening on port 3001");
});

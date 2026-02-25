import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "eventsdb",
  password: "Dxub71de",
  port: 5432,
});

export const db = drizzle(pool);

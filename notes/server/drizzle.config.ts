import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    user: "postgres",
    host: "localhost",
    database: "eventsdb",
    password: "Dxub71de",
    port: 5432,
    ssl: false,
  },
});

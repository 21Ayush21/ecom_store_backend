import { Pool } from "pg";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "../models/Schema"

dotenv.config();

const POSTGRES_URL = process.env.DATABASE_URL as string;

export const pool = new Pool({
  connectionString: POSTGRES_URL,
});

export const db = drizzle(pool, { schema})

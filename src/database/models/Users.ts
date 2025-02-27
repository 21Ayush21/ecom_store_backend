import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const UserModel = pgTable("users" , {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role : text("role", {enum: ["user", "admin", "seller"]}).default("user"),
  isVerified: boolean("is_verified").default(false),
  verificationToken: text("verification_token"),
  createdAt: timestamp("created_at").defaultNow().notNull()
})
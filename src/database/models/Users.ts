import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { InferSelectModel, sql } from "drizzle-orm";

export const UserModel = pgTable("users" , {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  role : text("role", {enum: ["user", "admin", "seller"]}).default("user"),
  isVerified: boolean("is_verified").default(false),
  verificationToken: text("verification_token"),
  refreshToken: text("refresh_token"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

// export type User_new = InferSelectModel<typeof UserModel>

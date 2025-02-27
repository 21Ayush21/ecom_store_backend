import { defineConfig } from "drizzle-kit"
import { config } from "dotenv"

config()

export default defineConfig({
    schema: "./src/database/models/Users.ts",
    dialect: "postgresql",
    out:"./drizzle",
    dbCredentials: {
        url: process.env.DATABASE_URL!
    }
})
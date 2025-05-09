import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import express from "express";
import passport from "passport";
import "./auth/auth";
import { UserModel } from "./database/models/Users";
import "./database/plugins/database";
import { db } from "./database/plugins/database";
import { getUserByEmail } from "./database/services/UserServices";
import authRouter from "./routes/authRoute";
import productRouter from "./routes/productRoute";
import {
  generateAccessToken,
  generateRefreshToken
} from "./utils/Tokens";

dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());

app.post("/api/auth", async (request, response) => {
  try {
    const { email, password } = request.body;

    const users = await getUserByEmail(email);
    if (!users || users.length === 0) {
      return response.status(404).json({
        message: "User not found",
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response.status(401).json({
        message: "Invalid Credentials",
      });
    }

    const userForToken = {
      id: user.id,
      email: user.email,
      role: user.role as "user" | "seller" | "admin",
    };

    const accessToken = generateAccessToken(userForToken);
    const refreshToken = generateRefreshToken(userForToken);

    const expriresAt = new Date();
    expriresAt.setDate(expriresAt.getDate() + 7);

    await db
      .update(UserModel)
      .set({ refreshToken: refreshToken, refreshTokenExpiresAt: expriresAt })
      .where(eq(UserModel.id, user.id));

    response.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1 * 60 * 60 * 1000,
    });

    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    response.json({
      message: "Login Successfull",
      user: {
        email: user.email,
        id: user.id,
        role: user.role,
      },
    });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Login Failed", error: (error as Error).message });
  }
});

app.get(
  "/api/auth/status",
  passport.authenticate("jwt", { session: false }),
  (request, response) => {
    const user = request.user as any;

    response.json({
      isAuthenticated: true,
      user: {
        email: user.email,
        id: user.id,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  }
);

app.use("/api/auth", authRouter);
app.use("/api",productRouter )

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

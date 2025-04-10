import express from "express";
import { Request, Response } from "express";
import { UserModel } from "../database/models/Users";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createUser, getUserByEmail, getUserById } from "../database/services/UserServices";
import { db } from "../database/plugins/database";
import { eq } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/Tokens";
import jwt from "jsonwebtoken"

dotenv.config();

const authRouter = express.Router();

authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: "24h" });

    const newUser = await createUser(email, hashedPassword, verificationToken);

    const verificationUrl = `${process.env.FRONTEND_URL}/user/verify?token=${verificationToken}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      secure: true,
      port: 465,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
    });

    await transporter.sendMail({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verification Email",
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: "User Created. Check your email for verification Link" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: (error as Error).message });
  }
});

authRouter.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;

    if (typeof token !== "string") {
      return res.status(400).json({ message: "Invalid token" });
    }

    const decodeToken = verifyToken(token);
    const { email } = decodeToken as { email: string };

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    await db
      .update(UserModel)
      .set({ isVerified: true, verificationToken: null })
      .where(eq(UserModel.email, email));

    return res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Invalid or expired token" });
  }
});

authRouter.post("/refresh-token", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const payload = verifyToken(refreshToken);
    if (!payload || !payload.id) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await getUserById(payload.id);
    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      user[0].refreshToken !== refreshToken ||
      !user[0].refreshTokenExpiresAt ||
      new Date() > new Date(user[0].refreshTokenExpiresAt)
    ) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const newAccessToken = generateAccessToken({
      id: user[0].id,
      email: user[0].email,
      role: user[0].role as "user" | "seller" | "admin",
    });

    const newRefreshToken = generateRefreshToken({
      id: user[0].id,
      email: user[0].email,
      role: user[0].role as "user" | "seller" | "admin",
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db
      .update(UserModel)
      .set({
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: expiresAt,
      })
      .where(eq(UserModel.id, user[0].id));

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to refresh token",
      error: (error as Error).message,
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const payload = verifyToken(refreshToken);
      const user = await getUserById(payload.id);

      if (user && user.length > 0) {
        await db
          .update(UserModel)
          .set({ refreshToken: null, refreshTokenExpiresAt: null })
          .where(eq(UserModel.id, user[0].id));
      }
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Logout failed",
      error: (error as Error).message,
    });
  }
});

export default authRouter;
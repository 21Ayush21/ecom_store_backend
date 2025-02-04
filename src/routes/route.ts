import express from "express";
import UserModel from "../database/models/Users";
import type { Request, Response } from "express";

const authRouter = express.Router();

authRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = new UserModel({ email, password, role });
    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: (error as Error).message });
    return;
  }
});

export default authRouter;

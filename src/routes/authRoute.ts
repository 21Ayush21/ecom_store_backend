import express from "express";
import UserModel from "../database/models/Users";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"
import bycrypt from "bcryptjs"
import dotenv from "dotenv"
import { getUserByEmail } from "../database/services/UserServices";

dotenv.config()

const authRouter = express.Router();

authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email , password } = req.body;

    const hashedPassword = await bycrypt.hash(password , 10) 

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET! , {expiresIn: "1h"});

    const newUser = new UserModel({
      email,
      password:hashedPassword,
      verificationToken
    })

    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`

    await newUser.save();

    const transporter = nodemailer.createTransport({
      host:'smtp.resend.com',
      secure: true,
      port: 465,
      auth:{
        user:'resend',
        pass: process.env.RESEND_API_KEY
      }
    })

    await transporter.sendMail({
      from: 'onboarding@resend.dev',
      to: email,
      subject: "Verification Email",
      html:`<p> Click <a href="${verificationUrl}"> here </a> to verify your email.</p>`
    })

    res.status(201).json({ message: "User Created. Check your email for verification Link"})
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: (error as Error).message });
    return;
  }
});


authRouter.get("/verify",async(req , res)=>{
  try {
    const { token } = req.query;

    if (typeof token !== 'string') {
      return res.status(400).json({ message: "Invalid token" });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET!);

    const { email } = decodeToken as {email: string} 

    const user = await getUserByEmail(email)
    console.log("user in verify",user)

    if(!user){
      return res.status(400).json({message: "User not found"})
    }

    user.isVerified = true
    await user.save()

    return res.json({ message: "Email verified successfully. You can now log in." });

  } catch (error){
    res.status(500).json({message: "Invalid or expired token"})
  }
})

export default authRouter;

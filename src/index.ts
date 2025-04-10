import express from "express";
import "./database/plugins/database"
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import "./auth/auth";
import authRouter from "./routes/authRoute";
import cors from "cors";
import { isAuthenticated } from "./middleware/protectedMiddleware";
import { getUserByEmail } from "./database/services/UserServices";
import { generateAccessToken, generateRefreshToken } from "./utils/Tokens";
import { db } from "./database/plugins/database";
import { UserModel } from "./database/models/Users";
import { eq } from "drizzle-orm";


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

app.options("*", cors())
app.use(express.json());


app.use(passport.initialize());

app.post("/api/auth", passport.authenticate("local", {session: false}), async(request, response) => {
  try{
    const {email , id} = request.user as {email:string , id: string}

    const userFromDB = await getUserByEmail(email);

    if(!userFromDB){
      return response.status(404).json({
        message:"User not found"
      })
    }

    const user = userFromDB[0];

    const accessToken = generateAccessToken({id: user.id, email:user.email , role: user.role as "user" | "seller" | "admin"})

    const refreshToken = generateRefreshToken({id: user.id, email:user.email , role: user.role as "user" | "seller" | "admin"})

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.update(UserModel).set({refreshToken: refreshToken, refreshTokenExpiresAt:expiresAt}).where(eq(UserModel.id , user.id))

    response.json({
      message: "Login Successfully",
      user: {
        email: user.email,
        id: user.id,
        role: user.role
      },
      accessToken,
      refreshToken,
      redirect:'/home'
    })
  } catch(error){
    response.status(500).json({message: "Login Failed" , error: (error as Error).message})
  }

});

app.get("/api/auth/status",isAuthenticated, (request, response) => {
  
  const user = request.user as any

  if (!user){
    return response.json({ isAuthenticated: false})
  }

  response.json({
    isAuthenticated:true,
    user: {
      email: user.email,
      id: user.id,
      role: user.role
    }
  })
});
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
})
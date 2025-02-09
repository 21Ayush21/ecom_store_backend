import express from "express";
import { connectDB } from "./database/plugins/mongo";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import "./auth/auth";
import authRouter from "./routes/authRoute";
import cors from "cors";

dotenv.config();

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

app.use(
  session({
    secret: "your_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000 * 60,
      secure: false,
      sameSite:"lax",
      httpOnly: true
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.post("/auth", passport.authenticate("local"), (request, response) => {
  response.json({ message: "Logged in successfully" });
});

app.get("/auth/status", (request, response) => {
  console.log(request.session);
  return request.user ? response.send(request.user) : response.sendStatus(401);
});
app.use("/users", authRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Server started at http://localhost:3000");
  });
});

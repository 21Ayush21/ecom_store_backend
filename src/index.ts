import express from "express";
import "./database/plugins/database"
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import "./auth/auth";
import authRouter from "./routes/authRoute";
import cors from "cors";
import { isAuthenticated } from "./middleware/protectedMiddleware";


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
  const { email , _id } = request.user as {email:string , _id:string}
  response.json({ message: "Logged in successfully" , user:{email , _id} , redirect:'/home'});
});

app.get("/auth/status", (request, response) => {
  if(request.isAuthenticated()){
    return response.json({ isAuthenticated: true, user: request.user})
  } else{
    return response.json({isAuthenticated: false})
  }
});
app.use("/user", authRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
})
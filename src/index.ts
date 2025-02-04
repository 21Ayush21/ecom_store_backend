import express from "express"
import { connectDB } from "./database/plugins/mongo"
import dotenv from "dotenv"
import passport from "passport"
import session from "express-session"
import "./auth/auth"
import authRouter from "./routes/route"


dotenv.config()

const app = express()
app.use(express.json())

app.use(
  session({
    secret: "your_secret",
    resave:false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000 * 60
    }
  })
)


app.use(passport.initialize())
app.use(passport.session())


app.post("/auth", passport.authenticate("local"), (request , response) =>{
  
})
app.use("/users", authRouter);

app.get('/', (req , res)=>{
  res.send("Hello World")
})


connectDB().then(() => {
  app.listen(process.env.PORT, ()=> {
    console.log("Server started at http://localhost:3000")
  })
})



import express from "express"
import { isAuthenticated } from "../middleware/protectedMiddleware";

const userRouter = express.Router();

userRouter.use(isAuthenticated)

userRouter.get("/profile" , (req , res)=>{
    
})
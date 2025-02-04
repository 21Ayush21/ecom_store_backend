import passport from "passport";
import {Strategy} from "passport-local"
import { getUserByEmail } from "../database/services/UserServices";

export default passport.use(
    new Strategy( {usernameField:"email"},(username , password , done) =>{
        console.log(`user ${username}`)
        try{
            const findUser = getUserByEmail(username , password)
            if (!findUser){
                throw new Error("User not found")
            }
            done(null , findUser);
        } catch(error){
            done(error,false);
        }
    })
)
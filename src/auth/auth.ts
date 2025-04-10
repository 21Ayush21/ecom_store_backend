import dotenv from "dotenv";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { getUserById } from "../database/services/UserServices";

dotenv.config();

const opts ={
  jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies['accessToken']]),
  secretOrKey: process.env.JWT_SECRET!
}

passport.use(
  new JwtStrategy(opts , async (jwt_payload , done) => {
    try{
      const user = await getUserById(jwt_payload.id);

      if(!user || user.length === 0){
        return done(null , false, {message: "User not found"})
      }

      const userForRequest = {
        id: user[0].id,
        email: user[0].email,
        role: user[0].role || "user"
      }

      done(null , userForRequest)
    }catch(error){
      done(error , false)
    }
  })
)

export default passport;

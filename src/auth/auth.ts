import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy } from "passport-local";
import { getUserByEmail } from "../database/services/UserServices";

export default passport.use(
  new Strategy({ usernameField: "email" }, async (email, password, done) => {
    console.log(`user ${email}`);
    try {
      const findUser = await getUserByEmail(email);
      console.log("Authenticated user:", findUser);
      if (!findUser) {
        throw new Error("User not found");
      }
      
      const user = findUser[0]

      const isMatch = await bcrypt.compare(password, findUser[0].password);
      if (!isMatch) {
        console.log("Invalid credentials");
        return done(null, false, { message: "Invalid credentials" });
      }

      const userForToken = {
        id: user.id,
        email: user.email,
        role: user.role || 'user' 
      };
      done(null, userForToken);
    } catch (error) {
      return done(error, false);
    }
  })
);


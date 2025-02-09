import passport from "passport";
import { Strategy } from "passport-local";
import { getUserByEmail } from "../database/services/UserServices";
import bcrypt from "bcryptjs";

export default passport.use(
  new Strategy({ usernameField: "email" }, async (username, password, done) => {
    console.log(`user ${username}`);
    try {
      const findUser = await getUserByEmail(username);
      console.log("Authenticated user:", findUser);
      if (!findUser) {
        throw new Error("User not found");
      }

      const isMatch = await bcrypt.compare(password, findUser.password);
      if (!isMatch) {
        console.log("Invalid password");
        return done(null, false, { message: "Invalid password" });
      }

      done(null, findUser);
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.serializeUser((user: any, done) => {
  console.log("serialize user:", user.email);
  done(null, user.email);
});

passport.deserializeUser(async (email: string, done) => {
  console.log("Deserialized user:", email);
  try {
    const finduser = await getUserByEmail(email);
    if (!finduser) {
      return done(new Error("User not found"));
    }
    done(null, finduser);
  } catch (error) {
    done(error);
  }
});

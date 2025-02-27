import { db } from "../plugins/database";
import { UserModel } from "../models/Users";
import { eq } from "drizzle-orm";

export const createUser = async (email: string, password: string, verificationToken: string) => {
  try {
    console.log("Inserting user:", { email, password, verificationToken });

    const newUser = await db.insert(UserModel).values({
      email,
      password,
      verificationToken
    }).returning();

    console.log("User successfully inserted:", newUser);

    return newUser[0]; 
  } catch (error) {
    console.error("Error creating user:", error);
    throw error; 
  }
};


export const getUserByEmail = async (email: string)=>{
  const result = await db.select().from(UserModel).where(eq(UserModel.email, email)).limit(1);
  return result ?? null
}
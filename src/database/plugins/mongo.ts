import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URI as string;

export const connectDB = async (): Promise<void> => {
  try {
    if (!MONGODB_URL) {
      throw new Error("MongoDB URL is not defined in environment variables");
    }

    const con = await mongoose.connect(MONGODB_URL);
    console.log(`MongoDB connected at: ${con.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", (error as Error).message);
    process.exit(1); 
  }
};



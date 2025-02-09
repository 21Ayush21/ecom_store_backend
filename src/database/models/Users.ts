import mongoose, { Schema, Document, model } from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  role: "user" | "admin" | "seller";
  createdAt: Date;
  isVerified: boolean;
  verificationToken: string;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String },
    password: { type: String },
    role: { type: String, enum: ["user", "admin", "seller"], default: "user" },
    isVerified: {type: Boolean, default: false},
    verificationToken: {type: String}
  },
  { timestamps: true, collection:"users" }
);

const UserModel = model<IUser>("User", UserSchema);

export default UserModel;

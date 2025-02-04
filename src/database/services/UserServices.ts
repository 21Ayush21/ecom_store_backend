import UserModel from "../models/Users";

export const getUserByEmail = async (email: string , password:string) => {
  try {
    await UserModel.findOne({ email , password }).exec();
  } catch (error) {
    throw new Error(
      `Error fetching user by email: ${(error as Error).message}`
    );
  }
};

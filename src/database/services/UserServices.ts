import UserModel from "../models/Users";

export const getUserByEmail = async (email: string ) => {
  try {
    const user = await UserModel.findOne({ email  }).exec();
    return user || null;
  } catch (error) {
    throw new Error(
      `Error fetching user by email: ${(error as Error).message}`
    );
  }
};
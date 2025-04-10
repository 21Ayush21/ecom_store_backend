import { User_new } from "../database/models/Users";

declare global {
  namespace Express {
    interface User extends User_new {}
    interface Request {
      user?: User;
    }
  }
}

export {}
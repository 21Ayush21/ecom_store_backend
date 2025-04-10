import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { User_new } from "../database/models/Users";

export const isAuthenticated = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", { session: false }, (err:Error | null, user:User_new, info?: {message:string}) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return response.status(401).json({
        message: info?.message || "Authentication required",
        redirect: "/login",
      });
    }

    request.user = user; 
    next();
  })(request, response, next);
};

export const checkRole = (roles: string[]) => {
  return (request: Request, response: Response, next: NextFunction) => {
    isAuthenticated(request, response, () => {
      const user = request.user;

      if (!user) {
        return response.status(401).json({
          message: "Invalid or expired token",
          redirect: "/login",
        });
      }

      if (roles.includes(user.role as string)) {
        return next();
      }

      return response.status(403).json({
        message: "Insufficient Permissions",
      });
    });
  };
};
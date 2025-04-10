import { Request, Response, NextFunction } from "express";
import { extractTokenFromHeader, verifyToken } from "../utils/Tokens";

export const isAuthenticated = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const authHeader =
    request.headers.authorization || request.headers.Authorization;
  const token = extractTokenFromHeader(authHeader as string);

  if (!token) {
    return response.status(401).json({
      message: "Authentication required",
      redirect: "/login",
    });
  }

  const userData = verifyToken(token);

  if (!userData) {
    return response.status(401).json({
      message: "Invalid or expired token",
      redirect: "/login",
    });
  }

  (request.user as any) = userData;

  next();
};

export const checkRole = (role: string[]) => {
  return (request: Request, response: Response, next: NextFunction) => {
    isAuthenticated(request, response, () => {
      const user = request.user;

      if (!user) {
        return response.status(401).json({
          message: "Invalid or expired token",
          redirect: "/login",
        });
      }

      if(role.includes(user.role as string)){
         return next()
      }


      return response.status(403).json({
         message: "Insufficient Permissions"
      })
    });
  };
};

import { Request, Response, NextFunction } from "express";

export const isAuthenticated = (request: Request , response: Response , next:NextFunction) => {
    if(request.isAuthenticated()){
        return next();
    }

    response.status(401).json({message:"Unauthorized User" , redirect: '/login'})
    
}
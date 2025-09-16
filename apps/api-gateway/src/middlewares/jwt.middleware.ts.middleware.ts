import { NextFunction, Request, Response } from 'express';
import { unless } from 'express-unless';
import * as jwt from 'jsonwebtoken'

export function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {

  const authHeader = req.headers['authorization'];
  if (!authHeader){
    return res.status(401).json({succes:false, message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if(!token){
    return res.status(401).json({succes:false, message : "Invalid Authorization header"})
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY!);
    req.headers["x-user-id"] = (decoded as any).id;
    req.headers["x-user-email"] = (decoded as any).email;
    next();
  } catch (error) {
    return res.status(403).json({succes:false, message: "Invalid or expired token" });
  }
}
(jwtMiddleware as any).unless = unless;
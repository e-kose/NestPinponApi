import { NextFunction, Request, Response } from 'express';
import { unless } from 'express-unless';
import * as jwt from 'jsonwebtoken'
export function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {

  if (req.path.startsWith("/auth/login") || req.path.startsWith("/auth/register") || req.path.endsWith("/docs")) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader){
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  if(!token){
    return res.status(401).json({message : "Invalid Authorization header"})
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
(jwtMiddleware as any).unless = unless;
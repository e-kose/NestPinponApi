import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

export function refreshToken(req: Request, res: Response, next: NextFunction) {
  if (req.url.startsWith('/auth/refresh_token')) {
    const refreshToken = (req as any).cookies['refresh_token'];
    if (!refreshToken) {
      return res
        .status(401)
        .json({ succes: false, message: 'Missing refresh_token cookies' });
    }
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_KEY!);
      req.headers['x-user-id'] = (decoded as any).id;
      req.headers['x-user-email'] = (decoded as any).email;

      next();
    } catch (error) {
      return res
        .status(403)
        .json({ succes: false, message: 'Invalid or expired token' });
    }
  } else return next();
}

import { Request, Response, NextFunction } from 'express';

function logger(req: Request, _res: Response, next: NextFunction) {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
}

export default logger;

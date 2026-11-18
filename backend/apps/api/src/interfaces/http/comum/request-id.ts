import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

// Sempre gerado no servidor: um X-Request-Id vindo do cliente não é confiável.
export function requestId(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Request-Id', `req_${randomUUID()}`);
  next();
}

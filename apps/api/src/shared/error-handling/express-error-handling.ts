import { errorHandler } from '@/shared/error-handling/error-handler';
import { NextFunction, Request, Response } from 'express';

// Middleware de error de Express (requiere exactamente 4 parámetros)
export function expressErrorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction) {
  errorHandler.handleError(err, res);
}
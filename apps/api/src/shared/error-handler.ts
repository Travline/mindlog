import type { ErrorRequestHandler } from 'express';
import { AppError } from './errors.js';
import { logger } from './logger.js';
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) { res.status(error.status).json({ error: error.message }); return; }
  if (error instanceof SyntaxError && 'status' in error && error.status === 400) { res.status(400).json({ error: 'JSON inválido' }); return; }
  if (error && typeof error === 'object' && 'code' in error && String(error.code).includes('SQLITE_CONSTRAINT')) { res.status(409).json({ error: 'El registro ya existe o viola una restricción' }); return; }
  logger.error({ err: error }, 'Error de petición');
  res.status(500).json({ error: 'Error interno del servidor' });
};

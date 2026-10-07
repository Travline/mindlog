import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { asyncLocalStorage } from '@/shared/context/async-context';
import { logger } from './logger';

export function httpContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 1. Obtener ID de cabecera o generar un UUID nuevo
  const transactionId = (req.headers['x-transaction-id'] as string) || randomUUID();

  // 2. Establecer en la respuesta para trazabilidad extremo a extremo
  res.setHeader('X-Transaction-Id', transactionId);

  // 3. Ejecutar la petición dentro del almacén asíncrono
  asyncLocalStorage.run({ transactionId }, () => {
    const startTime = Date.now();

    // Evento al completar la respuesta HTTP
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      logger.info(
        {
          http: {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTimeMs: responseTime,
          },
        },
        `HTTP ${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`
      );
    });

    next();
  });
}

import { Response } from 'express';
import { logger } from '@/shared/logger/logger';
import { AppError } from '@/shared/error-handling/app-error';
import HttpCode from '@/shared/enums/http-code';

class ErrorHandler {
  public handleError(error: Error, res: Response): void {
    const isOperational = error instanceof AppError && error.isOperational;
    const details = error instanceof AppError ? error.details || undefined : undefined;

    // 1. Registrar en Pino con los detalles si existen
    logger.error(
      {
        err: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          isOperational,
          details,
          ...(error instanceof AppError && { httpCode: error.httpCode }),
        },
      },
      `[ErrorHandler] ${error.message}`
    );

    // 2. Enviar respuesta HTTP estandarizada al cliente
    if (res && !res.headersSent) {
      const httpCode = error instanceof AppError ? error.httpCode : HttpCode.INTERNAL_SERVER_ERROR;
      const responseMessage = isOperational
        ? error.message
        : 'Ocurrió un error interno en el servidor';

      res.status(httpCode).json({
        status: 'error',
        code: error.name || 'INTERNAL_SERVER_ERROR',
        message: responseMessage,
        ...(details && { errors: details }), // Incluye los campos con error de validación
      });
    }

    // 3. Reiniciar el proceso únicamente en errores no operacionales (catastróficos)
    if (!isOperational) {
      logger.fatal('Error no operacional detectado. Reiniciando el proceso...');
      process.exit(1);
    }
  }
}

export const errorHandler = new ErrorHandler();

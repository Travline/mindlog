import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodObject } from 'zod';
import { AppError } from '@/shared/error-handling/app-error';
import HttpCode from '@/shared/enums/http-code';

export const validateBody = (schema: ZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        const validationError = new AppError(
          'VALIDATION_ERROR',
          HttpCode.BAD_REQUEST,
          'Los datos enviados en la petición no son válidos',
          true,
          formattedErrors
        );

        return next(validationError);
      }

      return next(error);
    }
  };
};
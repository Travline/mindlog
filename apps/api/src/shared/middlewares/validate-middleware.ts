import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

// Se usa en el router.METHOD o app.METHOD pasandole el schema del body que se espera recibir
export const validateBody = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      // Solo maneja errores de validación de Zod, otros errores se pasan al siguiente middleware (error handler)
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'fail',
          errors: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return next(error);
    }
  };
};
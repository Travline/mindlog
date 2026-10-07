import { JWT_SECRET } from '@/config/env';
import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { AppError } from '../error-handling/app-error';
import HttpCode from '../enums/http-code';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError(
      "MISSING_SESSION_TOKEN",
      HttpCode.UNAUTHORIZED,
      "Falta el token para autenticar el usuario",
      true
    ))
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.userId || typeof payload.userId !== 'string') {
      next(new AppError(
        "MISSING_AUTHENTICATION_SUBJECT",
        HttpCode.UNAUTHORIZED,
        "Falta el id del usuario en el payload",
        true
      ))
      return;
    }

    req.userId = payload.userId;
    next();
  } catch (error) {
    next(error)
  }
};
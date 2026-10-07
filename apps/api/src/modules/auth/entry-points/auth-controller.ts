import { CreateUserReq, CreateUserRes } from "@mindlog/types";
import { NextFunction, Request, Response } from "express";
import { createUser } from "@/modules/auth/domain/auth-service";
import HttpCode from "@/shared/enums/http-code";
import { SignJWT } from 'jose';
import { JWT_SECRET } from "@/config/env";

export const generateAccessToken = async (userId: string): Promise<string> => {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // Duración extendida para el proyecto
    .sign(JWT_SECRET);
};

export async function registerUser(
  req: Request<{}, CreateUserRes, CreateUserReq, {}>,
  res: Response<CreateUserRes>,
  next: NextFunction
) {
  try {
    const { username, email, password } = req.body

    const createdUser = await createUser({
      email,
      password,
      username
    })

    const accessToken = await generateAccessToken(createdUser.userId as string);

    res
      .set({ 'X-Access-Token': accessToken })
      .status(HttpCode.CREATED)
      .json({
        userId: createdUser.userId as string,
        email: createdUser.email,
        username: createdUser.email
      })
  } catch (error) {
    next(error)
  }
}

import { UserEntity } from "@/modules/auth/domain/auth-entities";
import { v7 as uuidv7 } from "uuid";
import { findByEmail, save } from "@/modules/auth/data-access/auth-repository";
import { AppError } from "@/shared/error-handling/app-error";
import HttpCode from "@/shared/enums/http-code";
import { compare, hash } from "bcrypt";

const SALT_ROUNDS = 10

export async function createUser(userDto: UserEntity): Promise<UserEntity> {
  const userFound = await findByEmail(userDto.email.trim());
  if (userFound) {
    throw new AppError(
      'USER_ALREADY_EXISTS',
      HttpCode.CONFLICT,
      `El correo ${userDto.email.trim()} ya está en uso`,
      true
    );
  }

  const encodedPassword = await hash(userDto.password.trim(), SALT_ROUNDS);
  const generatedId = uuidv7();

  const newUser: UserEntity = {
    email: userDto.email.trim(),
    password: encodedPassword,
    username: userDto.username.trim(),
    userId: generatedId
  }

  const savedUser = await save(newUser);

  if (!savedUser) {
    throw new AppError(
      'USER_NOT_PERSISTED',
      HttpCode.INTERNAL_SERVER_ERROR,
      `El usuario no pudo ser creado`,
      false
    );
  }

  return savedUser;
}

export async function authenticateUser(credentials: Pick<UserEntity, 'email' | 'password'>): Promise<UserEntity> {
  const userFound = await findByEmail(credentials.email.trim());
  if (!userFound) {
    throw new AppError(
      'INVALID_CREDENTIALS',
      HttpCode.UNAUTHORIZED,
      'Correo o contraseña incorrectos',
      true
    );
  }

  const isPasswordValid = await compare(credentials.password.trim(), userFound.password);
  if (!isPasswordValid) {
    throw new AppError(
      'INVALID_CREDENTIALS',
      HttpCode.UNAUTHORIZED,
      'Correo o contraseña incorrectos',
      true
    );
  }

  return userFound;
}
import * as z from "zod";

const CreateUserSchema = z.object({
  username: z
    .string()
    .min(2, "Ingresa un nombre valido con al menos 2 caracteres")
    .max(100),

  email: z
    .email("Ingresa un correo valido"),

  password: z
    .string()
    .min(8, "La contraseña debe contener al menos 8 caracteres")
    .max(100),
});

type CreateUserReq = z.infer<typeof CreateUserSchema>;

const CreateUserResSchema = z.object({
  userId: z.string(),
  username: z.string(),
  email: z.string(),
});

type CreateUserRes = z.infer<typeof CreateUserResSchema>;

export {
  CreateUserSchema,
  CreateUserResSchema,
};

export type {
  CreateUserReq,
  CreateUserRes,
};

const LoginUserSchema = z.object({
  email: z
    .email("Ingresa un correo valido"),

  password: z
    .string()
    .min(8, "La contraseña debe contener al menos 8 caracteres")
    .max(100),
});

type LoginUserReq = z.infer<typeof LoginUserSchema>;

const LoginUserResSchema = z.object({
  userId: z.string(),
  username: z.string(),
  email: z.string(),
});

type LoginUserRes = z.infer<typeof LoginUserResSchema>;

export {
  LoginUserSchema,
  LoginUserResSchema,
};

export type {
  LoginUserReq,
  LoginUserRes,
};
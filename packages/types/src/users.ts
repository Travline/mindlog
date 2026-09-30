import * as z from 'zod';

const CreateUserSchema = z.object({
  username: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(100),
});

// Tipo de dato que responde el parse() del schema
type CreateUserReq = z.infer<typeof CreateUserSchema>;

type CreateUserRes = {
  userId: string
  username: string
  email: string
}

export { CreateUserSchema };
export type { CreateUserReq };
export type { CreateUserRes };

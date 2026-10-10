import * as z from "zod";
declare const CreateUserSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
type CreateUserReq = z.infer<typeof CreateUserSchema>;
declare const CreateUserResSchema: z.ZodObject<{
    userId: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
}, z.core.$strip>;
type CreateUserRes = z.infer<typeof CreateUserResSchema>;
export { CreateUserSchema, CreateUserResSchema, };
export type { CreateUserReq, CreateUserRes, };
declare const LoginUserSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
type LoginUserReq = z.infer<typeof LoginUserSchema>;
declare const LoginUserResSchema: z.ZodObject<{
    userId: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
}, z.core.$strip>;
type LoginUserRes = z.infer<typeof LoginUserResSchema>;
export { LoginUserSchema, LoginUserResSchema, };
export type { LoginUserReq, LoginUserRes, };

import * as z from 'zod';
declare const CreateUserSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
/**
 * Es el tipo proveniente de CreateUserSchema
 */
type CreateUserReq = z.infer<typeof CreateUserSchema>;
type CreateUserRes = {
    userId: string;
    username: string;
    email: string;
};
export { CreateUserSchema };
export type { CreateUserReq };
export type { CreateUserRes };

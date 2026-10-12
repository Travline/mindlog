import * as z from "zod";
declare const CreateBoardSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type CreateBoardReq = z.infer<typeof CreateBoardSchema>;
declare const UpdateBoardSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type UpdateBoardReq = z.infer<typeof UpdateBoardSchema>;
declare const BoardResSchema: z.ZodObject<{
    boardId: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    ownerId: z.ZodString;
    createdAt: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
type BoardRes = z.infer<typeof BoardResSchema>;
export { CreateBoardSchema, UpdateBoardSchema, BoardResSchema };
export type { CreateBoardReq, UpdateBoardReq, BoardRes };

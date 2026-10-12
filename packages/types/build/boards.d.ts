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
declare const BoardFilterSchema: z.ZodDefault<z.ZodEnum<{
    all: "all";
    owned: "owned";
    shared: "shared";
}>>;
type BoardFilter = z.infer<typeof BoardFilterSchema>;
declare const GetBoardsQuerySchema: z.ZodObject<{
    filter: z.ZodDefault<z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        all: "all";
        owned: "owned";
        shared: "shared";
    }>>>>;
}, z.core.$strip>;
type GetBoardsQuery = z.infer<typeof GetBoardsQuerySchema>;
declare const BoardResSchema: z.ZodObject<{
    boardId: z.ZodNumber;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    ownerId: z.ZodString;
    isOwner: z.ZodBoolean;
    createdAt: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
type BoardRes = z.infer<typeof BoardResSchema>;
export { CreateBoardSchema, UpdateBoardSchema, BoardFilterSchema, GetBoardsQuerySchema, BoardResSchema, };
export type { CreateBoardReq, UpdateBoardReq, BoardFilter, GetBoardsQuery, BoardRes, };

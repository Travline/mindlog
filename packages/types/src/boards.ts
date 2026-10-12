import * as z from "zod";

const CreateBoardSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(200, "El título no puede superar los 200 caracteres"),

  description: z
    .string()
    .max(1000, "La descripción no puede superar los 1000 caracteres")
    .optional(),
});

type CreateBoardReq = z.infer<typeof CreateBoardSchema>;

const UpdateBoardSchema = z.object({
  title: z
    .string()
    .min(1, "El título es requerido")
    .max(200, "El título no puede superar los 200 caracteres")
    .optional(),

  description: z
    .string()
    .max(1000, "La descripción no puede superar los 1000 caracteres")
    .optional(),
});

type UpdateBoardReq = z.infer<typeof UpdateBoardSchema>;

const BoardResSchema = z.object({
  boardId: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  ownerId: z.string(),
  createdAt: z.string().nullable(),
});

type BoardRes = z.infer<typeof BoardResSchema>;

export { CreateBoardSchema, UpdateBoardSchema, BoardResSchema };

export type { CreateBoardReq, UpdateBoardReq, BoardRes };

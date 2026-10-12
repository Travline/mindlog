import { Router } from "express";
import { validateBody } from "@/shared/middlewares/validate-body";
import { CreateBoardSchema, UpdateBoardSchema } from "@mindlog/types";
import {
  handleCreate,
  handleGetAll,
  handleGetOne,
  handleUpdate,
  handleDelete,
} from "./entry-points/board-controller";

const router = Router();

router.post("/", validateBody(CreateBoardSchema), handleCreate);
router.get("/", handleGetAll);
router.get("/:id", handleGetOne);
router.put("/:id", validateBody(UpdateBoardSchema), handleUpdate);
router.delete("/:id", handleDelete);

export default router;

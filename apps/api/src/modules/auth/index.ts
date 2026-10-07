import { Router } from "express";
import { validateBody } from "@/shared/middlewares/validate-body";
import { CreateUserSchema } from "@mindlog/types";
import { registerUser } from "./entry-points/auth-controller";

const router = Router();

router.post("/register", validateBody(CreateUserSchema), registerUser);

export default router;
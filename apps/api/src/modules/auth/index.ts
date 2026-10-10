import { Router } from "express";
import { validateBody } from "@/shared/middlewares/validate-body";
import { CreateUserSchema, LoginUserSchema } from "@mindlog/types";
import { registerUser, loginUser } from "./entry-points/auth-controller";

const router = Router();

router.post("/register", validateBody(CreateUserSchema), registerUser);
router.post("/login", validateBody(LoginUserSchema), loginUser);

export default router;
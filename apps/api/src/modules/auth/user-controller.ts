import { Router } from "express";
import { UserService } from "@/modules/auth/user-service";
import { validateBody } from "@/shared/middlewares/validate-middleware";
import { CreateUserSchema } from "@mindlog/types";

const router = Router();
const service = new UserService()

router.post("/register", validateBody(CreateUserSchema), service.create);

export default router;
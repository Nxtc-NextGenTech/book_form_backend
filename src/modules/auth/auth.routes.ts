import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  adminLoginSchema,
  institutionLoginSchema,
  parentLoginSchema,
  parentSecurityQuestionSchema
} from "./auth.schemas";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";

const router = Router();

const repository = new AuthRepository();
const service = new AuthService(repository);
const controller = new AuthController(service);

router.post("/admin/login", validate(adminLoginSchema), asyncHandler(controller.adminLogin));
router.post(
  "/institution/login",
  validate(institutionLoginSchema),
  asyncHandler(controller.institutionLogin)
);
router.post("/parent/login", validate(parentLoginSchema), asyncHandler(controller.parentLogin));
router.get(
  "/parent/security-question",
  validate(parentSecurityQuestionSchema),
  asyncHandler(controller.getParentSecurityQuestion)
);

export default router;

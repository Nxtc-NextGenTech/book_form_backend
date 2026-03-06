import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { ParentsController } from "./parents.controller";
import { ParentsRepository } from "./parents.repository";
import {
  createParentStudentSchema,
  institutionParentsSchema,
  parentStudentsSchema,
  publicSecurityQuestionSchema,
  resetParentSecuritySchema,
  submitParentFormSchema
} from "./parents.schemas";
import { ParentsService } from "./parents.service";

const router = Router();

const repository = new ParentsRepository();
const service = new ParentsService(repository);
const controller = new ParentsController(service);

router.post(
  "/parent/submit-form",
  validate(submitParentFormSchema),
  asyncHandler(controller.submitForm)
);

router.get(
  "/public/institution/:slug/security-question",
  validate(publicSecurityQuestionSchema),
  asyncHandler(controller.getRandomSecurityQuestion)
);

router.get(
  "/parent/students",
  requireAuth,
  requireRole("PARENT"),
  validate(parentStudentsSchema),
  asyncHandler(controller.getStudents)
);

router.post(
  "/parent/student",
  requireAuth,
  requireRole("PARENT"),
  validate(createParentStudentSchema),
  asyncHandler(controller.createStudent)
);

router.get(
  "/institution/parents",
  requireAuth,
  requireRole("INSTITUTION"),
  validate(institutionParentsSchema),
  asyncHandler(controller.listInstitutionParents)
);

router.post(
  "/institution/parent/reset-password",
  requireAuth,
  requireRole("INSTITUTION"),
  validate(resetParentSecuritySchema),
  asyncHandler(controller.resetParentSecurity)
);

export default router;

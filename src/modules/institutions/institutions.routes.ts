import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  activateInstitutionSchema,
  formSettingsSchema,
  registerInstitutionSchema,
  resetInstitutionPasswordSchema
} from "./institutions.schemas";
import { InstitutionsController } from "./institutions.controller";
import { InstitutionsRepository } from "./institutions.repository";
import { InstitutionsService } from "./institutions.service";

const router = Router();

const repository = new InstitutionsRepository();
const service = new InstitutionsService(repository);
const controller = new InstitutionsController(service);

router.post(
  "/institution/register",
  validate(registerInstitutionSchema),
  asyncHandler(controller.registerInstitution)
);

router.get(
  "/admin/institutions",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(controller.getInstitutions)
);

router.post(
  "/admin/institution/activate",
  requireAuth,
  requireRole("ADMIN"),
  validate(activateInstitutionSchema),
  asyncHandler(controller.activateInstitution)
);

router.post(
  "/admin/institution/reset-password",
  requireAuth,
  requireRole("ADMIN"),
  validate(resetInstitutionPasswordSchema),
  asyncHandler(controller.resetInstitutionPassword)
);

router.get(
  "/institution/dashboard",
  requireAuth,
  requireRole("INSTITUTION"),
  asyncHandler(controller.getDashboard)
);

router.post(
  "/institution/form-settings",
  requireAuth,
  requireRole("INSTITUTION"),
  validate(formSettingsSchema),
  asyncHandler(controller.updateFormSettings)
);

export default router;

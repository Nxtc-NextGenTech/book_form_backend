import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { StudentsController } from "./students.controller";
import { StudentsRepository } from "./students.repository";
import {
  createClassDivisionSchema,
  publicClassDivisionSchema,
  updateClassDivisionSchema
} from "./students.schemas";
import { StudentsService } from "./students.service";

const router = Router();

const repository = new StudentsRepository();
const service = new StudentsService(repository);
const controller = new StudentsController(service);

router.get(
  "/institution/classes",
  requireAuth,
  requireRole("INSTITUTION"),
  asyncHandler(controller.listClassDivisions)
);

router.post(
  "/institution/classes",
  requireAuth,
  requireRole("INSTITUTION"),
  validate(createClassDivisionSchema),
  asyncHandler(controller.createClassDivision)
);

router.put(
  "/institution/classes/:id",
  requireAuth,
  requireRole("INSTITUTION"),
  validate(updateClassDivisionSchema),
  asyncHandler(controller.updateClassDivision)
);

router.get(
  "/public/institution/:slug/classes",
  validate(publicClassDivisionSchema),
  asyncHandler(controller.listPublicClassDivisions)
);

export default router;

import { Router } from "express";
import analyticsRoutes from "../modules/analytics/analytics.routes";
import authRoutes from "../modules/auth/auth.routes";
import catalogRoutes from "../modules/catalog/catalog.routes";
import institutionsRoutes from "../modules/institutions/institutions.routes";
import ordersRoutes from "../modules/orders/orders.routes";
import parentsRoutes from "../modules/parents/parents.routes";
import paymentsRoutes from "../modules/payments/payments.routes";
import studentsRoutes from "../modules/students/students.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

router.use(authRoutes);
router.use(institutionsRoutes);
router.use(catalogRoutes);
router.use(parentsRoutes);
router.use(ordersRoutes);
router.use(paymentsRoutes);
router.use(studentsRoutes);
router.use(analyticsRoutes);

export default router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_routes_1 = __importDefault(require("../modules/analytics/analytics.routes"));
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const catalog_routes_1 = __importDefault(require("../modules/catalog/catalog.routes"));
const institutions_routes_1 = __importDefault(require("../modules/institutions/institutions.routes"));
const orders_routes_1 = __importDefault(require("../modules/orders/orders.routes"));
const parents_routes_1 = __importDefault(require("../modules/parents/parents.routes"));
const payments_routes_1 = __importDefault(require("../modules/payments/payments.routes"));
const students_routes_1 = __importDefault(require("../modules/students/students.routes"));
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "OK" });
});
router.use(auth_routes_1.default);
router.use(institutions_routes_1.default);
router.use(catalog_routes_1.default);
router.use(parents_routes_1.default);
router.use(orders_routes_1.default);
router.use(payments_routes_1.default);
router.use(students_routes_1.default);
router.use(analytics_routes_1.default);
exports.default = router;

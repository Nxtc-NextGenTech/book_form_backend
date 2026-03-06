"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addInstitutionLedgerPaymentSchema = exports.addParentPaymentSchema = void 0;
const zod_1 = require("zod");
exports.addParentPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderId: zod_1.z.string().uuid(),
        amount: zod_1.z.number().positive(),
        method: zod_1.z.string().min(2),
        note: zod_1.z.string().max(500).optional()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.addInstitutionLedgerPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        institutionId: zod_1.z.string().uuid(),
        amount: zod_1.z.number().positive(),
        note: zod_1.z.string().max(500).optional()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});

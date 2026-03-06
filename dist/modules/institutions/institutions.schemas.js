"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formSettingsSchema = exports.resetInstitutionPasswordSchema = exports.activateInstitutionSchema = exports.registerInstitutionSchema = void 0;
const zod_1 = require("zod");
exports.registerInstitutionSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        mobile: zod_1.z.string().min(8),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        subscriptionFee: zod_1.z.number().positive().optional()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.activateInstitutionSchema = zod_1.z.object({
    body: zod_1.z.object({
        institutionId: zod_1.z.string().uuid(),
        subscriptionFee: zod_1.z.number().positive().optional()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.resetInstitutionPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        institutionId: zod_1.z.string().uuid(),
        newPassword: zod_1.z.string().min(8)
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.formSettingsSchema = zod_1.z.object({
    body: zod_1.z.object({
        formStartDate: zod_1.z.string().datetime().nullable(),
        formEndDate: zod_1.z.string().datetime().nullable(),
        paymentMethods: zod_1.z.array(zod_1.z.string().min(1)).default([]),
        onlinePaymentInstruction: zod_1.z.string().max(500).nullable().optional()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});

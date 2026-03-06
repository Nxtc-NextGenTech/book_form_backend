"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parentSecurityQuestionSchema = exports.parentLoginSchema = exports.institutionLoginSchema = exports.adminLoginSchema = void 0;
const zod_1 = require("zod");
exports.adminLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8)
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.institutionLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        mobile: zod_1.z.string().min(8),
        password: zod_1.z.string().min(8)
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.parentLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        mobile: zod_1.z.string().min(8),
        securityAnswer: zod_1.z.string().min(1)
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.parentSecurityQuestionSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({}),
    query: zod_1.z.object({
        mobile: zod_1.z.string().min(8)
    })
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetParentSecuritySchema = exports.institutionParentsSchema = exports.createParentStudentSchema = exports.parentStudentsSchema = exports.publicSecurityQuestionSchema = exports.submitParentFormSchema = void 0;
const zod_1 = require("zod");
const orderItemSchema = zod_1.z.object({
    itemId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().positive()
});
exports.submitParentFormSchema = zod_1.z.object({
    body: zod_1.z.object({
        institutionSlug: zod_1.z.string().min(2),
        studentName: zod_1.z.string().min(2),
        class: zod_1.z.string().min(1),
        division: zod_1.z.string().min(1),
        parentMobile: zod_1.z.string().min(8),
        securityQuestionId: zod_1.z.string().uuid(),
        securityAnswer: zod_1.z.string().min(1),
        items: zod_1.z.array(orderItemSchema).min(1)
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.publicSecurityQuestionSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({
        slug: zod_1.z.string().min(2)
    }),
    query: zod_1.z.object({
        mobile: zod_1.z.string().min(8).optional()
    })
});
exports.parentStudentsSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({}),
    query: zod_1.z.object({
        institutionId: zod_1.z.string().uuid().optional()
    })
});
exports.createParentStudentSchema = zod_1.z.object({
    body: zod_1.z.object({
        institutionId: zod_1.z.string().uuid(),
        name: zod_1.z.string().min(2),
        class: zod_1.z.string().min(1),
        division: zod_1.z.string().min(1)
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.institutionParentsSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.resetParentSecuritySchema = zod_1.z.object({
    body: zod_1.z.object({
        parentId: zod_1.z.string().uuid(),
        newSecurityAnswer: zod_1.z.string().min(1),
        securityQuestionId: zod_1.z.string().uuid().optional()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});

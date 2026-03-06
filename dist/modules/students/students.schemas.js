"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicClassDivisionSchema = exports.updateClassDivisionSchema = exports.createClassDivisionSchema = void 0;
const zod_1 = require("zod");
exports.createClassDivisionSchema = zod_1.z.object({
    body: zod_1.z.object({
        className: zod_1.z.string().min(1),
        divisionName: zod_1.z.string().min(1)
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.updateClassDivisionSchema = zod_1.z.object({
    body: zod_1.z.object({
        className: zod_1.z.string().min(1).optional(),
        divisionName: zod_1.z.string().min(1).optional(),
        isActive: zod_1.z.boolean().optional()
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid()
    }),
    query: zod_1.z.object({})
});
exports.publicClassDivisionSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({
        slug: zod_1.z.string().min(2)
    }),
    query: zod_1.z.object({})
});

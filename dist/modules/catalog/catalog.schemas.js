"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicCatalogSchema = exports.updateInstitutionItemSchema = exports.createInstitutionItemSchema = exports.updateMasterCatalogItemSchema = exports.listMasterCatalogSchema = exports.createMasterCatalogItemSchema = void 0;
const zod_1 = require("zod");
const categorySchema = zod_1.z.enum(["SUBJECT", "NOTEBOOK", "MUSHAF", "CUSTOM"]);
exports.createMasterCatalogItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        category: categorySchema,
        defaultPrice: zod_1.z.number().positive(),
        gradeFrom: zod_1.z.number().int().positive().nullable().optional(),
        gradeTo: zod_1.z.number().int().positive().nullable().optional()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.listMasterCatalogSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.updateMasterCatalogItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        category: categorySchema.optional(),
        defaultPrice: zod_1.z.number().positive().optional(),
        gradeFrom: zod_1.z.number().int().positive().nullable().optional(),
        gradeTo: zod_1.z.number().int().positive().nullable().optional(),
        isActive: zod_1.z.boolean().optional()
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid()
    }),
    query: zod_1.z.object({})
});
exports.createInstitutionItemSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        masterItemId: zod_1.z.string().uuid().optional(),
        name: zod_1.z.string().min(2).optional(),
        category: categorySchema.optional(),
        price: zod_1.z.number().positive().optional(),
        isActive: zod_1.z.boolean().optional()
    })
        .refine((value) => value.masterItemId || (value.name && value.category && value.price), {
        message: "Either masterItemId or (name, category, price) is required"
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.updateInstitutionItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        price: zod_1.z.number().positive().optional(),
        isActive: zod_1.z.boolean().optional()
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid()
    }),
    query: zod_1.z.object({})
});
exports.publicCatalogSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({
        slug: zod_1.z.string().min(2)
    }),
    query: zod_1.z.object({
        class: zod_1.z.string().optional()
    })
});

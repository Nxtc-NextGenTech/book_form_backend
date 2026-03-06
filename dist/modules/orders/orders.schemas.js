"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parentOrderInvoiceSchema = exports.distributeOrderSchema = exports.updateParentOrderSchema = exports.createParentOrderSchema = void 0;
const zod_1 = require("zod");
const itemSchema = zod_1.z.object({
    itemId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().positive()
});
exports.createParentOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        studentId: zod_1.z.string().uuid(),
        items: zod_1.z.array(itemSchema).min(1)
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.updateParentOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        items: zod_1.z.array(itemSchema).min(1)
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid()
    }),
    query: zod_1.z.object({})
});
exports.distributeOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderId: zod_1.z.string().uuid()
    }),
    params: zod_1.z.object({}),
    query: zod_1.z.object({})
});
exports.parentOrderInvoiceSchema = zod_1.z.object({
    body: zod_1.z.object({}),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid()
    }),
    query: zod_1.z.object({})
});

import { z } from "zod";

const itemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().positive()
});

export const createParentOrderSchema = z.object({
  body: z.object({
    studentId: z.string().uuid(),
    items: z.array(itemSchema).min(1)
  }),
  params: z.object({}),
  query: z.object({})
});

export const updateParentOrderSchema = z.object({
  body: z.object({
    items: z.array(itemSchema).min(1)
  }),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({})
});

export const distributeOrderSchema = z.object({
  body: z.object({
    orderId: z.string().uuid()
  }),
  params: z.object({}),
  query: z.object({})
});

export const parentOrderInvoiceSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({})
});

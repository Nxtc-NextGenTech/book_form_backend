import { z } from "zod";

export const addParentPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    amount: z.number().positive(),
    method: z.string().min(2),
    note: z.string().max(500).optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const addInstitutionLedgerPaymentSchema = z.object({
  body: z.object({
    institutionId: z.string().uuid(),
    amount: z.number().positive(),
    note: z.string().max(500).optional()
  }),
  params: z.object({}),
  query: z.object({})
});

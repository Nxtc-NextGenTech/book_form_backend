import { z } from "zod";

export const registerInstitutionSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    mobile: z.string().min(8),
    email: z.string().email(),
    password: z.string().min(8),
    subscriptionFee: z.number().positive().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const activateInstitutionSchema = z.object({
  body: z.object({
    institutionId: z.string().uuid(),
    subscriptionFee: z.number().positive().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const resetInstitutionPasswordSchema = z.object({
  body: z.object({
    institutionId: z.string().uuid(),
    newPassword: z.string().min(8)
  }),
  params: z.object({}),
  query: z.object({})
});

export const formSettingsSchema = z.object({
  body: z.object({
    formStartDate: z.string().datetime().nullable(),
    formEndDate: z.string().datetime().nullable(),
    paymentMethods: z.array(z.string().min(1)).default([]),
    onlinePaymentInstruction: z.string().max(500).nullable().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

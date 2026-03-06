import { z } from "zod";

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  }),
  params: z.object({}),
  query: z.object({})
});

export const institutionLoginSchema = z.object({
  body: z.object({
    mobile: z.string().min(8),
    password: z.string().min(8)
  }),
  params: z.object({}),
  query: z.object({})
});

export const parentLoginSchema = z.object({
  body: z.object({
    mobile: z.string().min(8),
    securityAnswer: z.string().min(1)
  }),
  params: z.object({}),
  query: z.object({})
});

export const parentSecurityQuestionSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    mobile: z.string().min(8)
  })
});

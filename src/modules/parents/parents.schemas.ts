import { z } from "zod";

const orderItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().positive()
});

export const submitParentFormSchema = z.object({
  body: z.object({
    institutionSlug: z.string().min(2),
    studentName: z.string().min(2),
    class: z.string().min(1),
    division: z.string().min(1),
    parentMobile: z.string().min(8),
    securityQuestionId: z.string().uuid(),
    securityAnswer: z.string().min(1),
    items: z.array(orderItemSchema).min(1)
  }),
  params: z.object({}),
  query: z.object({})
});

export const publicSecurityQuestionSchema = z.object({
  body: z.object({}),
  params: z.object({
    slug: z.string().min(2)
  }),
  query: z.object({
    mobile: z.string().min(8).optional()
  })
});

export const parentStudentsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    institutionId: z.string().uuid().optional()
  })
});

export const createParentStudentSchema = z.object({
  body: z.object({
    institutionId: z.string().uuid(),
    name: z.string().min(2),
    class: z.string().min(1),
    division: z.string().min(1)
  }),
  params: z.object({}),
  query: z.object({})
});

export const institutionParentsSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({})
});

export const resetParentSecuritySchema = z.object({
  body: z.object({
    parentId: z.string().uuid(),
    newSecurityAnswer: z.string().min(1),
    securityQuestionId: z.string().uuid().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

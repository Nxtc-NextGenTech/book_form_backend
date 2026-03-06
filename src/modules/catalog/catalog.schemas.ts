import { z } from "zod";

const categorySchema = z.enum(["SUBJECT", "NOTEBOOK", "MUSHAF", "CUSTOM"]);

export const createMasterCatalogItemSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    category: categorySchema,
    defaultPrice: z.number().positive(),
    gradeFrom: z.number().int().positive().nullable().optional(),
    gradeTo: z.number().int().positive().nullable().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const listMasterCatalogSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({})
});

export const updateMasterCatalogItemSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    category: categorySchema.optional(),
    defaultPrice: z.number().positive().optional(),
    gradeFrom: z.number().int().positive().nullable().optional(),
    gradeTo: z.number().int().positive().nullable().optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({})
});

export const createInstitutionItemSchema = z.object({
  body: z
    .object({
      masterItemId: z.string().uuid().optional(),
      name: z.string().min(2).optional(),
      category: categorySchema.optional(),
      price: z.number().positive().optional(),
      isActive: z.boolean().optional()
    })
    .refine((value) => value.masterItemId || (value.name && value.category && value.price), {
      message: "Either masterItemId or (name, category, price) is required"
    }),
  params: z.object({}),
  query: z.object({})
});

export const updateInstitutionItemSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    price: z.number().positive().optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({})
});

export const publicCatalogSchema = z.object({
  body: z.object({}),
  params: z.object({
    slug: z.string().min(2)
  }),
  query: z.object({
    class: z.string().optional()
  })
});

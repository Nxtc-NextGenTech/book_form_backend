import { z } from "zod";

export const createClassDivisionSchema = z.object({
  body: z.object({
    className: z.string().min(1),
    divisionName: z.string().min(1)
  }),
  params: z.object({}),
  query: z.object({})
});

export const updateClassDivisionSchema = z.object({
  body: z.object({
    className: z.string().min(1).optional(),
    divisionName: z.string().min(1).optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({})
});

export const publicClassDivisionSchema = z.object({
  body: z.object({}),
  params: z.object({
    slug: z.string().min(2)
  }),
  query: z.object({})
});

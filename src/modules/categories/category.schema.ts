import { z } from 'zod';

export const createCategorySchema = z
  .object({
    code: z.string().min(1).max(120),
    name: z.string().min(1).max(120),
    annualRatePence: z.number().int().min(0).max(100000000),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    annualRatePence: z.number().int().min(0).max(100000000).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, 'Say what to change');

export const categoryIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const categoryQuerySchema = z
  .object({
    code: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

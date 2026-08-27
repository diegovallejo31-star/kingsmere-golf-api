import { z } from 'zod';

export const createBuggyHireSchema = z
  .object({
    buggyRef: z.string().min(1).max(120),
    feePence: z.number().int().min(0).max(10000000),
  })
  .strict();

export const buggyHireIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const bookingIdParamSchema = z.object({ bookingId: z.coerce.number().int().positive() });

export const buggyHireQuerySchema = z
  .object({
    buggyRef: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

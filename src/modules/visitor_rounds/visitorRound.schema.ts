import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createVisitorRoundSchema = z
  .object({
    visitorName: z.string().min(1).max(120),
    onDay: dayString,
    holes: z
      .number()
      .int()
      .refine((n) => n === 9 || n === 18, 'a round is 9 or 18 holes'),
    feePence: z.number().int().min(0).max(10000000),
  })
  .strict();

export const visitorRoundIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const clubIdParamSchema = z.object({ clubId: z.coerce.number().int().positive() });

export const visitorRoundQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

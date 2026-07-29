import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createClubSchema = z
  .object({
    code: z.string().min(1).max(120),
    name: z.string().min(1).max(120),
    town: z.string().min(1).max(120),
    holes: z
      .number()
      .int()
      .refine((n) => n === 9 || n === 18 || n === 27, 'a course is 9, 18 or 27 holes'),
    foundedOn: dayString,
  })
  .strict();

export const clubIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const clubQuerySchema = z
  .object({
    code: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

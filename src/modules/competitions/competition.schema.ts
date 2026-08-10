import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createCompetitionSchema = z
  .object({
    name: z.string().min(1).max(120),
    onDay: dayString,
    format: z.enum(['medal', 'stableford', 'matchplay']),
    entryFeePence: z.number().int().min(0).max(10000000),
  })
  .strict();

export const updateCompetitionSchema = z
  .object({
    entryFeePence: z.number().int().min(0).max(10000000).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, 'Say what to change');

export const competitionIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const clubIdParamSchema = z.object({ clubId: z.coerce.number().int().positive() });

export const competitionQuerySchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    format: z.enum(['medal', 'stableford', 'matchplay']).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

import { z } from 'zod';
import { ENTRY_STATUSES } from './entry.types';

export const createEntrySchema = z
  .object({
    memberId: z.number().int().positive(),
  })
  .strict();

export const entryIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const competitionIdParamSchema = z.object({
  competitionId: z.coerce.number().int().positive(),
});

export const entryQuerySchema = z
  .object({
    status: z.enum(ENTRY_STATUSES as [string, ...string[]]).optional(),
    memberId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const entryWithdrawalSchema = z.object({ status: z.enum(['withdrawn']) }).strict();

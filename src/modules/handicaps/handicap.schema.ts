import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createHandicapSchema = z
  .object({
    recordedOn: dayString,
    exactTenths: z.number().int().min(0).max(540),
    reason: z.string().min(1).max(120),
  })
  .strict();

export const handicapIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const memberIdParamSchema = z.object({ memberId: z.coerce.number().int().positive() });

export const handicapQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const memberCurrentParamSchema = z
  .object({ memberId: z.coerce.number().int().positive() })
  .strict();

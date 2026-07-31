import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createMemberSchema = z
  .object({
    memberRef: z.string().min(1).max(120),
    name: z.string().min(1).max(120),
    email: z.string().email().max(200).optional(),
    joinedOn: dayString,
  })
  .strict();

export const updateMemberSchema = z
  .object({
    email: z.string().email().max(200).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, 'Say what to change');

export const memberIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const memberQuerySchema = z
  .object({
    memberRef: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

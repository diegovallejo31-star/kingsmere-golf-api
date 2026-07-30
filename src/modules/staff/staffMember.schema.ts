import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createStaffMemberSchema = z
  .object({
    payrollNumber: z.string().min(1).max(120),
    name: z.string().min(1).max(120),
    role: z.enum(['professional', 'secretary', 'greens', 'bar']),
    startedOn: dayString,
  })
  .strict();

export const updateStaffMemberSchema = z
  .object({
    role: z.enum(['professional', 'secretary', 'greens', 'bar']).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, 'Say what to change');

export const staffMemberIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const clubIdParamSchema = z.object({ clubId: z.coerce.number().int().positive() });

export const staffMemberQuerySchema = z
  .object({
    payrollNumber: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

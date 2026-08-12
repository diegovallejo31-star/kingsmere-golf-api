import { z } from 'zod';
import { LOCKER_STATUSES } from './locker.types';

export const createLockerSchema = z
  .object({
    lockerNumber: z.string().min(1).max(120),
    annualRentPence: z.number().int().min(0).max(10000000),
  })
  .strict();

export const updateLockerSchema = z
  .object({
    annualRentPence: z.number().int().min(0).max(10000000).optional(),
  })
  .strict()
  .refine((patch) => Object.keys(patch).length > 0, 'Say what to change');

export const lockerIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const clubIdParamSchema = z.object({ clubId: z.coerce.number().int().positive() });

export const lockerQuerySchema = z
  .object({
    status: z.enum(LOCKER_STATUSES as [string, ...string[]]).optional(),
    lockerNumber: z.string().min(1).max(120).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

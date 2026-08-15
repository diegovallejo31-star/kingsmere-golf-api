import { z } from 'zod';
import { dayString } from '../../lib/schemas';
import { RENTAL_STATUSES } from './rental.types';

export const createRentalSchema = z
  .object({
    lockerId: z.number().int().positive(),
    takenOn: dayString,
  })
  .strict();

export const rentalIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const memberIdParamSchema = z.object({ memberId: z.coerce.number().int().positive() });

export const rentalQuerySchema = z
  .object({
    status: z.enum(RENTAL_STATUSES as [string, ...string[]]).optional(),
    lockerId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const rentalEndSchema = z.object({ status: z.enum(['ended']) }).strict();

import { z } from 'zod';
import { dayString } from '../../lib/schemas';
import { BOOKING_STATUSES } from './booking.types';

export const createBookingSchema = z
  .object({
    onDay: dayString,
    teeTime: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, 'a tee time is HH:MM'),
    holes: z
      .number()
      .int()
      .refine((n) => n === 9 || n === 18, 'a round is 9 or 18 holes'),
  })
  .strict();

export const bookingIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const memberIdParamSchema = z.object({ memberId: z.coerce.number().int().positive() });

export const bookingQuerySchema = z
  .object({
    status: z.enum(BOOKING_STATUSES as [string, ...string[]]).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const bookingStatusSchema = z
  .object({ status: z.enum(['played', 'cancelled']) })
  .strict();

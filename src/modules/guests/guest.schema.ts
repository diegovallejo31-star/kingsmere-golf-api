import { z } from 'zod';

export const createGuestSchema = z
  .object({
    name: z.string().min(1).max(120),
    greenFeePence: z.number().int().min(0).max(10000000),
  })
  .strict();

export const guestIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const bookingIdParamSchema = z.object({ bookingId: z.coerce.number().int().positive() });

export const guestQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

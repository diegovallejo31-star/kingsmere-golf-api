import { z } from 'zod';
import { dayString } from '../../lib/schemas';
import { SUBSCRIPTION_STATUSES } from './subscription.types';

export const createSubscriptionSchema = z
  .object({
    categoryId: z.number().int().positive(),
    seasonStart: dayString,
    seasonEnd: dayString,
    startedOn: dayString,
  })
  .strict();

export const subscriptionIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const memberIdParamSchema = z.object({ memberId: z.coerce.number().int().positive() });

export const subscriptionQuerySchema = z
  .object({
    status: z.enum(SUBSCRIPTION_STATUSES as [string, ...string[]]).optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

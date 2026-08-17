import { z } from 'zod';
import { dayString } from '../../lib/schemas';

export const createLessonSchema = z
  .object({
    proId: z.number().int().positive(),
    onDay: dayString,
    minutes: z.number().int().min(1).max(600),
    ratePence: z.number().int().min(1).max(10000000),
  })
  .strict();

export const lessonIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const memberIdParamSchema = z.object({ memberId: z.coerce.number().int().positive() });

export const lessonQuerySchema = z
  .object({
    proId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  })
  .strict();

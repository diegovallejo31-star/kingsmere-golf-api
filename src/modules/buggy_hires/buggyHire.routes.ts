import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { BookingRepository } from '../bookings/booking.repository';
import { BuggyHireController } from './buggyHire.controller';
import { BuggyHireRepository } from './buggyHire.repository';
import {
  bookingIdParamSchema,
  buggyHireIdParamSchema,
  buggyHireQuerySchema,
  createBuggyHireSchema,
} from './buggyHire.schema';
import { BuggyHireService } from './buggyHire.service';

function controllerFor(db: Database): BuggyHireController {
  return new BuggyHireController(
    new BuggyHireService(new BuggyHireRepository(db), new BookingRepository(db)),
  );
}

/** The buggy_hires of one booking, mounted under /bookings. */
export function createBookingBuggyHireRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:bookingId/buggy-hires',
    validateRequest({ params: bookingIdParamSchema, body: createBuggyHireSchema }),
    controller.create,
  );
  router.get(
    '/:bookingId/buggy-hires',
    validateRequest({ params: bookingIdParamSchema, query: buggyHireQuerySchema }),
    controller.list,
  );

  return router;
}

export function createBuggyHireRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: buggyHireIdParamSchema }), controller.getById);

  return router;
}

import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { BookingRepository } from '../bookings/booking.repository';
import { GuestController } from './guest.controller';
import { GuestRepository } from './guest.repository';
import {
  bookingIdParamSchema,
  createGuestSchema,
  guestIdParamSchema,
  guestQuerySchema,
} from './guest.schema';
import { GuestService } from './guest.service';

function controllerFor(db: Database): GuestController {
  return new GuestController(
    new GuestService(new GuestRepository(db), new BookingRepository(db)),
  );
}

/** The guests of one booking, mounted under /bookings. */
export function createBookingGuestRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:bookingId/guests',
    validateRequest({ params: bookingIdParamSchema, body: createGuestSchema }),
    controller.create,
  );
  router.get(
    '/:bookingId/guests',
    validateRequest({ params: bookingIdParamSchema, query: guestQuerySchema }),
    controller.list,
  );

  return router;
}

export function createGuestRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: guestIdParamSchema }), controller.getById);

  return router;
}

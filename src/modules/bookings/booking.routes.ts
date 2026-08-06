import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { MemberRepository } from '../members/member.repository';
import { BookingController } from './booking.controller';
import { BookingRepository } from './booking.repository';
import {
  bookingIdParamSchema,
  bookingQuerySchema,
  bookingStatusSchema,
  createBookingSchema,
  memberIdParamSchema,
} from './booking.schema';
import { BookingService } from './booking.service';

function controllerFor(db: Database): BookingController {
  return new BookingController(
    new BookingService(new BookingRepository(db), new MemberRepository(db)),
  );
}

/** The bookings of one member, mounted under /members. */
export function createMemberBookingRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:memberId/bookings',
    validateRequest({ params: memberIdParamSchema, body: createBookingSchema }),
    controller.create,
  );
  router.get(
    '/:memberId/bookings',
    validateRequest({ params: memberIdParamSchema, query: bookingQuerySchema }),
    controller.list,
  );

  return router;
}

export function createBookingRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: bookingIdParamSchema }), controller.getById);
  router.post(
    '/:id/status',
    validateRequest({ params: bookingIdParamSchema, body: bookingStatusSchema }),
    controller.changeStatus,
  );

  return router;
}

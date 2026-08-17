import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { LockerRepository } from '../lockers/locker.repository';
import { MemberRepository } from '../members/member.repository';
import { RentalController } from './rental.controller';
import { RentalRepository } from './rental.repository';
import {
  createRentalSchema,
  memberIdParamSchema,
  rentalEndSchema,
  rentalIdParamSchema,
  rentalQuerySchema,
} from './rental.schema';
import { RentalService } from './rental.service';

function controllerFor(db: Database): RentalController {
  return new RentalController(
    new RentalService(
      new RentalRepository(db),
      new MemberRepository(db),
      new LockerRepository(db),
    ),
  );
}

/** The rentals of one member, mounted under /members. */
export function createMemberRentalRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:memberId/rentals',
    validateRequest({ params: memberIdParamSchema, body: createRentalSchema }),
    controller.create,
  );
  router.get(
    '/:memberId/rentals',
    validateRequest({ params: memberIdParamSchema, query: rentalQuerySchema }),
    controller.list,
  );

  return router;
}

export function createRentalRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: rentalIdParamSchema }), controller.getById);
  router.post(
    '/:id/end',
    validateRequest({ params: rentalIdParamSchema, body: rentalEndSchema }),
    controller.end,
  );

  return router;
}

import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { ClubRepository } from '../clubs/club.repository';
import { LockerController } from './locker.controller';
import { LockerRepository } from './locker.repository';
import {
  clubIdParamSchema,
  createLockerSchema,
  lockerIdParamSchema,
  lockerQuerySchema,
  updateLockerSchema,
} from './locker.schema';
import { LockerService } from './locker.service';

function controllerFor(db: Database): LockerController {
  return new LockerController(
    new LockerService(new LockerRepository(db), new ClubRepository(db)),
  );
}

/** The lockers of one club, mounted under /clubs. */
export function createClubLockerRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:clubId/lockers',
    validateRequest({ params: clubIdParamSchema, body: createLockerSchema }),
    controller.create,
  );
  router.get(
    '/:clubId/lockers',
    validateRequest({ params: clubIdParamSchema, query: lockerQuerySchema }),
    controller.list,
  );

  return router;
}

export function createLockerRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: lockerIdParamSchema }), controller.getById);
  router.patch(
    '/:id',
    validateRequest({ params: lockerIdParamSchema, body: updateLockerSchema }),
    controller.update,
  );

  return router;
}

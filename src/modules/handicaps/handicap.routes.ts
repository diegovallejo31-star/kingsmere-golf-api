import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { MemberRepository } from '../members/member.repository';
import { HandicapController } from './handicap.controller';
import { HandicapRepository } from './handicap.repository';
import {
  createHandicapSchema,
  handicapIdParamSchema,
  handicapQuerySchema,
  memberCurrentParamSchema,
  memberIdParamSchema,
} from './handicap.schema';
import { HandicapService } from './handicap.service';

function controllerFor(db: Database): HandicapController {
  return new HandicapController(
    new HandicapService(new HandicapRepository(db), new MemberRepository(db)),
  );
}

/** The handicaps of one member, mounted under /members. */
export function createMemberHandicapRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:memberId/handicaps',
    validateRequest({ params: memberIdParamSchema, body: createHandicapSchema }),
    controller.create,
  );
  router.get(
    '/:memberId/handicaps',
    validateRequest({ params: memberIdParamSchema, query: handicapQuerySchema }),
    controller.list,
  );

  return router;
}

export function createHandicapRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: handicapIdParamSchema }), controller.getById);
  router.get(
    '/member/:memberId/current',
    validateRequest({ params: memberCurrentParamSchema }),
    controller.current,
  );

  return router;
}

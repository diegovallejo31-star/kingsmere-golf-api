import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { ClubRepository } from '../clubs/club.repository';
import { VisitorRoundController } from './visitorRound.controller';
import { VisitorRoundRepository } from './visitorRound.repository';
import {
  clubIdParamSchema,
  createVisitorRoundSchema,
  visitorRoundIdParamSchema,
  visitorRoundQuerySchema,
} from './visitorRound.schema';
import { VisitorRoundService } from './visitorRound.service';

function controllerFor(db: Database): VisitorRoundController {
  return new VisitorRoundController(
    new VisitorRoundService(new VisitorRoundRepository(db), new ClubRepository(db)),
  );
}

/** The visitor_rounds of one club, mounted under /clubs. */
export function createClubVisitorRoundRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:clubId/visitor-rounds',
    validateRequest({ params: clubIdParamSchema, body: createVisitorRoundSchema }),
    controller.create,
  );
  router.get(
    '/:clubId/visitor-rounds',
    validateRequest({ params: clubIdParamSchema, query: visitorRoundQuerySchema }),
    controller.list,
  );

  return router;
}

export function createVisitorRoundRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get(
    '/:id',
    validateRequest({ params: visitorRoundIdParamSchema }),
    controller.getById,
  );

  return router;
}

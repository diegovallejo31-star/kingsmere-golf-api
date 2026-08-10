import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { ClubRepository } from '../clubs/club.repository';
import { CompetitionController } from './competition.controller';
import { CompetitionRepository } from './competition.repository';
import {
  clubIdParamSchema,
  competitionIdParamSchema,
  competitionQuerySchema,
  createCompetitionSchema,
  updateCompetitionSchema,
} from './competition.schema';
import { CompetitionService } from './competition.service';

function controllerFor(db: Database): CompetitionController {
  return new CompetitionController(
    new CompetitionService(new CompetitionRepository(db), new ClubRepository(db)),
  );
}

/** The competitions of one club, mounted under /clubs. */
export function createClubCompetitionRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:clubId/competitions',
    validateRequest({ params: clubIdParamSchema, body: createCompetitionSchema }),
    controller.create,
  );
  router.get(
    '/:clubId/competitions',
    validateRequest({ params: clubIdParamSchema, query: competitionQuerySchema }),
    controller.list,
  );

  return router;
}

export function createCompetitionRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: competitionIdParamSchema }), controller.getById);
  router.patch(
    '/:id',
    validateRequest({ params: competitionIdParamSchema, body: updateCompetitionSchema }),
    controller.update,
  );

  return router;
}

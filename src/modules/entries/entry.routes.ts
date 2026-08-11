import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { CompetitionRepository } from '../competitions/competition.repository';
import { MemberRepository } from '../members/member.repository';
import { EntryController } from './entry.controller';
import { EntryRepository } from './entry.repository';
import {
  competitionIdParamSchema,
  createEntrySchema,
  entryIdParamSchema,
  entryQuerySchema,
  entryWithdrawalSchema,
} from './entry.schema';
import { EntryService } from './entry.service';

function controllerFor(db: Database): EntryController {
  return new EntryController(
    new EntryService(
      new EntryRepository(db),
      new CompetitionRepository(db),
      new MemberRepository(db),
    ),
  );
}

/** The entries of one competition, mounted under /competitions. */
export function createCompetitionEntryRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:competitionId/entries',
    validateRequest({ params: competitionIdParamSchema, body: createEntrySchema }),
    controller.create,
  );
  router.get(
    '/:competitionId/entries',
    validateRequest({ params: competitionIdParamSchema, query: entryQuerySchema }),
    controller.list,
  );

  return router;
}

export function createEntryRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: entryIdParamSchema }), controller.getById);
  router.post(
    '/:id/withdraw',
    validateRequest({ params: entryIdParamSchema, body: entryWithdrawalSchema }),
    controller.withdraw,
  );

  return router;
}

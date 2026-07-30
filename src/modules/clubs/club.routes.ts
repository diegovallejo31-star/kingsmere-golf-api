import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { ClubController } from './club.controller';
import { ClubRepository } from './club.repository';
import { clubIdParamSchema, clubQuerySchema, createClubSchema } from './club.schema';
import { ClubService } from './club.service';

function controllerFor(db: Database): ClubController {
  return new ClubController(new ClubService(new ClubRepository(db)));
}

export function createClubRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post('/', validateRequest({ body: createClubSchema }), controller.create);
  router.get('/', validateRequest({ query: clubQuerySchema }), controller.list);
  router.get('/:id', validateRequest({ params: clubIdParamSchema }), controller.getById);

  return router;
}

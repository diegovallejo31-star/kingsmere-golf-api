import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { MemberController } from './member.controller';
import { MemberRepository } from './member.repository';
import {
  createMemberSchema,
  memberIdParamSchema,
  memberQuerySchema,
  updateMemberSchema,
} from './member.schema';
import { MemberService } from './member.service';

function controllerFor(db: Database): MemberController {
  return new MemberController(new MemberService(new MemberRepository(db)));
}

export function createMemberRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post('/', validateRequest({ body: createMemberSchema }), controller.create);
  router.get('/', validateRequest({ query: memberQuerySchema }), controller.list);
  router.get('/:id', validateRequest({ params: memberIdParamSchema }), controller.getById);
  router.patch(
    '/:id',
    validateRequest({ params: memberIdParamSchema, body: updateMemberSchema }),
    controller.update,
  );

  return router;
}

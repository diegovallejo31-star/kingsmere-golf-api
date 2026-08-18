import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { MemberRepository } from '../members/member.repository';
import { StaffMemberRepository } from '../staff/staffMember.repository';
import { LessonController } from './lesson.controller';
import { LessonRepository } from './lesson.repository';
import {
  createLessonSchema,
  lessonIdParamSchema,
  lessonQuerySchema,
  memberIdParamSchema,
} from './lesson.schema';
import { LessonService } from './lesson.service';

function controllerFor(db: Database): LessonController {
  return new LessonController(
    new LessonService(
      new LessonRepository(db),
      new MemberRepository(db),
      new StaffMemberRepository(db),
    ),
  );
}

/** The lessons of one member, mounted under /members. */
export function createMemberLessonRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:memberId/lessons',
    validateRequest({ params: memberIdParamSchema, body: createLessonSchema }),
    controller.create,
  );
  router.get(
    '/:memberId/lessons',
    validateRequest({ params: memberIdParamSchema, query: lessonQuerySchema }),
    controller.list,
  );

  return router;
}

export function createLessonRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: lessonIdParamSchema }), controller.getById);

  return router;
}

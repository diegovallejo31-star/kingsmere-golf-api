import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { ClubRepository } from '../clubs/club.repository';
import { StaffMemberController } from './staffMember.controller';
import { StaffMemberRepository } from './staffMember.repository';
import {
  clubIdParamSchema,
  createStaffMemberSchema,
  staffMemberIdParamSchema,
  staffMemberQuerySchema,
  updateStaffMemberSchema,
} from './staffMember.schema';
import { StaffMemberService } from './staffMember.service';

function controllerFor(db: Database): StaffMemberController {
  return new StaffMemberController(
    new StaffMemberService(new StaffMemberRepository(db), new ClubRepository(db)),
  );
}

/** The staff of one club, mounted under /clubs. */
export function createClubStaffMemberRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:clubId/staff',
    validateRequest({ params: clubIdParamSchema, body: createStaffMemberSchema }),
    controller.create,
  );
  router.get(
    '/:clubId/staff',
    validateRequest({ params: clubIdParamSchema, query: staffMemberQuerySchema }),
    controller.list,
  );

  return router;
}

export function createStaffMemberRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get('/:id', validateRequest({ params: staffMemberIdParamSchema }), controller.getById);
  router.patch(
    '/:id',
    validateRequest({ params: staffMemberIdParamSchema, body: updateStaffMemberSchema }),
    controller.update,
  );

  return router;
}

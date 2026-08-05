import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { CategoryRepository } from '../categories/category.repository';
import { MemberRepository } from '../members/member.repository';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionRepository } from './subscription.repository';
import {
  createSubscriptionSchema,
  memberIdParamSchema,
  subscriptionIdParamSchema,
  subscriptionQuerySchema,
} from './subscription.schema';
import { SubscriptionService } from './subscription.service';

function controllerFor(db: Database): SubscriptionController {
  return new SubscriptionController(
    new SubscriptionService(
      new SubscriptionRepository(db),
      new MemberRepository(db),
      new CategoryRepository(db),
    ),
  );
}

/** The subscriptions of one member, mounted under /members. */
export function createMemberSubscriptionRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post(
    '/:memberId/subscriptions',
    validateRequest({ params: memberIdParamSchema, body: createSubscriptionSchema }),
    controller.create,
  );
  router.get(
    '/:memberId/subscriptions',
    validateRequest({ params: memberIdParamSchema, query: subscriptionQuerySchema }),
    controller.list,
  );

  return router;
}

export function createSubscriptionRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.get(
    '/:id',
    validateRequest({ params: subscriptionIdParamSchema }),
    controller.getById,
  );

  return router;
}

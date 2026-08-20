import { Router } from 'express';
import type { Database } from '../../db/client';
import { validateRequest } from '../../middleware/validateRequest';
import { EntryRepository } from '../entries/entry.repository';
import { LessonRepository } from '../lessons/lesson.repository';
import { MemberRepository } from '../members/member.repository';
import { SubscriptionRepository } from '../subscriptions/subscription.repository';
import { InvoiceController } from './invoice.controller';
import { InvoiceRepository } from './invoice.repository';
import {
  createInvoiceSchema,
  invoiceIdParamSchema,
  invoiceQuerySchema,
} from './invoice.schema';
import { InvoiceService } from './invoice.service';

function controllerFor(db: Database): InvoiceController {
  return new InvoiceController(
    new InvoiceService(
      new InvoiceRepository(db),
      new MemberRepository(db),
      new SubscriptionRepository(db),
      new LessonRepository(db),
      new EntryRepository(db),
    ),
  );
}

export function createInvoiceRouter(db: Database): Router {
  const router = Router();
  const controller = controllerFor(db);

  router.post('/', validateRequest({ body: createInvoiceSchema }), controller.create);
  router.get('/', validateRequest({ query: invoiceQuerySchema }), controller.list);
  router.get('/:id', validateRequest({ params: invoiceIdParamSchema }), controller.getById);

  return router;
}

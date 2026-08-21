import express, { type Express } from 'express';
import type { Database } from './db/client';
import { apiKeyAuth } from './middleware/apiKeyAuth';
import { auditLog } from './middleware/auditLog';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimit } from './middleware/rateLimit';
import { requestLogger } from './middleware/requestLogger';
import { createApiKeyRouter } from './modules/apikeys/apiKey.routes';
import { createAuditRouter } from './modules/audit/audit.routes';
import { createAuthRouter } from './modules/auth/auth.routes';
import {
  createBookingRouter,
  createMemberBookingRouter,
} from './modules/bookings/booking.routes';
import { createCategoryRouter } from './modules/categories/category.routes';
import { createClubRouter } from './modules/clubs/club.routes';
import {
  createClubCompetitionRouter,
  createCompetitionRouter,
} from './modules/competitions/competition.routes';
import {
  createCompetitionEntryRouter,
  createEntryRouter,
} from './modules/entries/entry.routes';
import { createBookingGuestRouter, createGuestRouter } from './modules/guests/guest.routes';
import { createInvoiceRouter } from './modules/invoices/invoice.routes';
import { createLessonRouter, createMemberLessonRouter } from './modules/lessons/lesson.routes';
import { createClubLockerRouter, createLockerRouter } from './modules/lockers/locker.routes';
import { createMemberRouter } from './modules/members/member.routes';
import { createPaymentRouter } from './modules/payments/payment.routes';
import { createMemberRentalRouter, createRentalRouter } from './modules/rentals/rental.routes';
import {
  createClubStaffMemberRouter,
  createStaffMemberRouter,
} from './modules/staff/staffMember.routes';
import {
  createMemberSubscriptionRouter,
  createSubscriptionRouter,
} from './modules/subscriptions/subscription.routes';

export function createApp(db: Database): Express {
  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.use(rateLimit(db));
  app.use(auditLog(db));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const { router: authRouter } = createAuthRouter(db);
  app.use('/auth', authRouter);

  const requireApiKey = apiKeyAuth(db);
  app.use('/api-keys', requireApiKey, createApiKeyRouter(db));
  app.use('/audit', requireApiKey, createAuditRouter(db));
  app.use('/clubs', requireApiKey, createClubRouter(db));
  app.use('/clubs', requireApiKey, createClubStaffMemberRouter(db));
  app.use('/staff', requireApiKey, createStaffMemberRouter(db));
  app.use('/members', requireApiKey, createMemberRouter(db));
  app.use('/categories', requireApiKey, createCategoryRouter(db));
  app.use('/members', requireApiKey, createMemberSubscriptionRouter(db));
  app.use('/subscriptions', requireApiKey, createSubscriptionRouter(db));
  app.use('/members', requireApiKey, createMemberBookingRouter(db));
  app.use('/bookings', requireApiKey, createBookingRouter(db));
  app.use('/bookings', requireApiKey, createBookingGuestRouter(db));
  app.use('/guests', requireApiKey, createGuestRouter(db));
  app.use('/clubs', requireApiKey, createClubCompetitionRouter(db));
  app.use('/competitions', requireApiKey, createCompetitionRouter(db));
  app.use('/competitions', requireApiKey, createCompetitionEntryRouter(db));
  app.use('/entries', requireApiKey, createEntryRouter(db));
  app.use('/clubs', requireApiKey, createClubLockerRouter(db));
  app.use('/lockers', requireApiKey, createLockerRouter(db));
  app.use('/members', requireApiKey, createMemberRentalRouter(db));
  app.use('/rentals', requireApiKey, createRentalRouter(db));
  app.use('/members', requireApiKey, createMemberLessonRouter(db));
  app.use('/lessons', requireApiKey, createLessonRouter(db));
  app.use('/invoices', requireApiKey, createInvoiceRouter(db));
  app.use('/payments', requireApiKey, createPaymentRouter(db));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

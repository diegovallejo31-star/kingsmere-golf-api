import type { Express } from 'express';
import { api } from './apiClient';

/**
 * Makers for the tests.
 *
 * Each one creates the least it can get away with and hands back an id, so a
 * test that cares about charges does not have to know how a site is spelt.
 * Counters keep every generated code unique inside one run.
 */
let seq = 0;

function next(): number {
  seq += 1;
  return seq;
}

export async function makeClub(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const res = await api(app)
    .post('/clubs')
    .send({
      code: `KGM${n}`,
      name: 'Kingsmere',
      town: 'Kingsmere',
      holes: 18,
      foundedOn: '1974-04-01',
      ...fields,
    });
  if (res.status !== 201) {
    throw new Error(`makeClub: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeStaffMember(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { clubId: parent, ...rest } = fields as { clubId?: number };
  const clubId = parent ?? (await makeClub(app));
  const res = await api(app)
    .post(`/clubs/${clubId}/staff`)
    .send({
      payrollNumber: `12${n}`,
      name: 'Duncan Aird',
      role: 'professional',
      startedOn: '2016-02-01',
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeStaffMember: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeMember(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const res = await api(app)
    .post('/members')
    .send({
      memberRef: `M-0071${n}`,
      name: 'Eleanor Frost',
      joinedOn: '2021-04-01',
      ...fields,
    });
  if (res.status !== 201) {
    throw new Error(`makeMember: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeCategory(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const res = await api(app)
    .post('/categories')
    .send({
      code: `FULL${n}`,
      name: 'Full playing',
      annualRatePence: 96000,
      ...fields,
    });
  if (res.status !== 201) {
    throw new Error(`makeCategory: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeSubscription(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { memberId: parent, ...rest } = fields as { memberId?: number };
  const memberId = parent ?? (await makeMember(app));
  const categoryId = await makeCategory(app);
  const res = await api(app)
    .post(`/members/${memberId}/subscriptions`)
    .send({
      categoryId: categoryId,
      seasonStart: '2025-01-01',
      seasonEnd: '2026-01-01',
      startedOn: '2025-01-01',
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeSubscription: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeBooking(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { memberId: parent, ...rest } = fields as { memberId?: number };
  const memberId = parent ?? (await makeMember(app));
  const res = await api(app)
    .post(`/members/${memberId}/bookings`)
    .send({
      onDay: '2025-06-14',
      teeTime: '08:40',
      holes: 18,
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeBooking: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeGuest(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { bookingId: parent, ...rest } = fields as { bookingId?: number };
  const bookingId = parent ?? (await makeBooking(app));
  const res = await api(app)
    .post(`/bookings/${bookingId}/guests`)
    .send({
      name: 'A. Visitor',
      greenFeePence: 4500,
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeGuest: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeCompetition(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { clubId: parent, ...rest } = fields as { clubId?: number };
  const clubId = parent ?? (await makeClub(app));
  const res = await api(app)
    .post(`/clubs/${clubId}/competitions`)
    .send({
      name: 'Club Championship',
      onDay: '2025-07-19',
      format: 'stableford',
      entryFeePence: 1500,
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeCompetition: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeEntry(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { competitionId: parent, ...rest } = fields as { competitionId?: number };
  const competitionId = parent ?? (await makeCompetition(app));
  const memberId = await makeMember(app);
  const res = await api(app)
    .post(`/competitions/${competitionId}/entries`)
    .send({
      memberId: memberId,
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeEntry: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeLocker(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { clubId: parent, ...rest } = fields as { clubId?: number };
  const clubId = parent ?? (await makeClub(app));
  const res = await api(app)
    .post(`/clubs/${clubId}/lockers`)
    .send({
      lockerNumber: `A14${n}`,
      annualRentPence: 4000,
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeLocker: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeRental(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { memberId: parent, ...rest } = fields as { memberId?: number };
  const memberId = parent ?? (await makeMember(app));
  const lockerId = await makeLocker(app);
  const res = await api(app)
    .post(`/members/${memberId}/rentals`)
    .send({
      lockerId: lockerId,
      takenOn: '2025-04-01',
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeRental: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeLesson(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const { memberId: parent, ...rest } = fields as { memberId?: number };
  const memberId = parent ?? (await makeMember(app));
  const proId = await makeStaffMember(app);
  const res = await api(app)
    .post(`/members/${memberId}/lessons`)
    .send({
      proId: proId,
      onDay: '2025-05-10',
      minutes: 30,
      ratePence: 6000,
      ...rest,
    });
  if (res.status !== 201) {
    throw new Error(`makeLesson: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

export async function makeInvoice(
  app: Express,
  fields: Record<string, unknown> = {},
): Promise<number> {
  const n = next();
  const memberId = await makeMember(app);
  const categoryId = await makeCategory(app, { annualRatePence: 73000 });
  await api(app).post(`/members/${memberId}/subscriptions`).send({
    categoryId,
    seasonStart: '2025-01-01',
    seasonEnd: '2026-01-01',
    startedOn: '2025-01-01',
  });
  const res = await api(app)
    .post('/invoices')
    .send({
      memberId: memberId,
      number: `GINV-1000${n}`,
      raisedOn: '2025-06-02',
      ...fields,
    });
  if (res.status !== 201) {
    throw new Error(`makeInvoice: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.id as number;
}

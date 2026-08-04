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

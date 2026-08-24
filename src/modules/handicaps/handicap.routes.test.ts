import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeHandicap, makeMember } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('handicaps over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const made = await api(app)
      .post(`/members/${memberId}/handicaps`)
      .send({ recordedOn: '2025-01-10', exactTenths: 180, reason: 'New member' });
    expect(made.status).toBe(201);

    const listed = await api(app).get(`/members/${memberId}/handicaps`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const made = await api(app)
      .post(`/members/${memberId}/handicaps`)
      .send({ recordedOn: '2025-01-10', exactTenths: 180, reason: 'New member' });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'exactTenths',
      'id',
      'memberId',
      'reason',
      'recordedOn',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const made = await api(app)
      .post(`/members/${memberId}/handicaps`)
      .send({ recordedOn: '2025-01-10', exactTenths: 180, reason: 'New member' });
    const read = await api(app).get(`/handicaps/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/handicaps/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app)
      .post(`/members/${memberId}/handicaps`)
      .send({ recordedOn: '2025-01-10', exactTenths: 180, reason: 'New member', nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app).get(`/members/${memberId}/handicaps?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the member is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/members/999999/handicaps')
      .send({ recordedOn: '2025-01-10', exactTenths: 180, reason: 'New member' });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    await makeHandicap(app, { memberId });
    await makeHandicap(app, { memberId });

    const all = await api(app).get(`/members/${memberId}/handicaps`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/members/${memberId}/handicaps?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/handicaps/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app).get(`/members/${memberId}/handicaps?limit=0`);
    expect(res.status).toBe(400);
  });

  it('plays the latest handicap by date, whatever order they went in', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    await api(app)
      .post(`/members/${memberId}/handicaps`)
      .send({ recordedOn: '2025-01-10', exactTenths: 180, reason: 'New member' });
    await api(app)
      .post(`/members/${memberId}/handicaps`)
      .send({ recordedOn: '2025-06-01', exactTenths: 156, reason: 'Cut after the medal' });
    // an earlier date going in last must not become the current one
    await api(app)
      .post(`/members/${memberId}/handicaps`)
      .send({ recordedOn: '2025-03-01', exactTenths: 172, reason: 'Review' });

    const current = await api(app).get(`/handicaps/member/${memberId}/current`);
    expect(current.status).toBe(200);
    expect(current.body.exactTenths).toBe(156);
  });
});

import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeClub, makeVisitorRound } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('visitor_rounds over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app)
      .post(`/clubs/${clubId}/visitor-rounds`)
      .send({ visitorName: 'R. Guest', onDay: '2025-06-20', holes: 18, feePence: 5500 });
    expect(made.status).toBe(201);

    const listed = await api(app).get(`/clubs/${clubId}/visitor-rounds`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app)
      .post(`/clubs/${clubId}/visitor-rounds`)
      .send({ visitorName: 'R. Guest', onDay: '2025-06-20', holes: 18, feePence: 5500 });
    expect(Object.keys(made.body).sort()).toEqual([
      'clubId',
      'createdAt',
      'feePence',
      'holes',
      'id',
      'onDay',
      'updatedAt',
      'visitorName',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app)
      .post(`/clubs/${clubId}/visitor-rounds`)
      .send({ visitorName: 'R. Guest', onDay: '2025-06-20', holes: 18, feePence: 5500 });
    const read = await api(app).get(`/visitor-rounds/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/visitor-rounds/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const res = await api(app)
      .post(`/clubs/${clubId}/visitor-rounds`)
      .send({
        visitorName: 'R. Guest',
        onDay: '2025-06-20',
        holes: 18,
        feePence: 5500,
        nonesuch: 1,
      });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const res = await api(app).get(`/clubs/${clubId}/visitor-rounds?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the club is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/clubs/999999/visitor-rounds')
      .send({ visitorName: 'R. Guest', onDay: '2025-06-20', holes: 18, feePence: 5500 });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);
    await makeVisitorRound(app, { clubId });
    await makeVisitorRound(app, { clubId });

    const all = await api(app).get(`/clubs/${clubId}/visitor-rounds`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/clubs/${clubId}/visitor-rounds?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/visitor-rounds/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const res = await api(app).get(`/clubs/${clubId}/visitor-rounds?limit=0`);
    expect(res.status).toBe(400);
  });
});

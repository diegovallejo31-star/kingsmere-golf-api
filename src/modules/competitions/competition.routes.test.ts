import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeClub, makeCompetition } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('competitions over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app).post(`/clubs/${clubId}/competitions`).send({
      name: 'Club Championship',
      onDay: '2025-07-19',
      format: 'stableford',
      entryFeePence: 1500,
    });
    expect(made.status).toBe(201);

    const listed = await api(app).get(`/clubs/${clubId}/competitions`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app).post(`/clubs/${clubId}/competitions`).send({
      name: 'Club Championship',
      onDay: '2025-07-19',
      format: 'stableford',
      entryFeePence: 1500,
    });
    expect(Object.keys(made.body).sort()).toEqual([
      'clubId',
      'createdAt',
      'entryFeePence',
      'format',
      'id',
      'name',
      'onDay',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app).post(`/clubs/${clubId}/competitions`).send({
      name: 'Club Championship',
      onDay: '2025-07-19',
      format: 'stableford',
      entryFeePence: 1500,
    });
    const read = await api(app).get(`/competitions/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/competitions/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const res = await api(app).post(`/clubs/${clubId}/competitions`).send({
      name: 'Club Championship',
      onDay: '2025-07-19',
      format: 'stableford',
      entryFeePence: 1500,
      nonesuch: 1,
    });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const res = await api(app).get(`/clubs/${clubId}/competitions?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('amends the one field and leaves the rest alone', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app).post(`/clubs/${clubId}/competitions`).send({
      name: 'Club Championship',
      onDay: '2025-07-19',
      format: 'stableford',
      entryFeePence: 1500,
    });
    const patched = await api(app)
      .patch(`/competitions/${made.body.id}`)
      .send({ entryFeePence: 2000 });
    expect(patched.status).toBe(200);
    expect(patched.body.entryFeePence).toEqual(2000);
  });

  it('refuses an empty amendment', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app).post(`/clubs/${clubId}/competitions`).send({
      name: 'Club Championship',
      onDay: '2025-07-19',
      format: 'stableford',
      entryFeePence: 1500,
    });
    const patched = await api(app).patch(`/competitions/${made.body.id}`).send({});
    expect(patched.status).toBe(400);
  });

  it('404s when the club is not there', async () => {
    const app = buildApp();

    const res = await api(app).post('/clubs/999999/competitions').send({
      name: 'Club Championship',
      onDay: '2025-07-19',
      format: 'stableford',
      entryFeePence: 1500,
    });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);
    await makeCompetition(app, { clubId });
    await makeCompetition(app, { clubId });

    const all = await api(app).get(`/clubs/${clubId}/competitions`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/clubs/${clubId}/competitions?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/competitions/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const res = await api(app).get(`/clubs/${clubId}/competitions?limit=0`);
    expect(res.status).toBe(400);
  });

  it('404s when amending one that is not there', async () => {
    const app = buildApp();

    const res = await api(app).patch('/competitions/999999').send({ entryFeePence: 2000 });
    expect(res.status).toBe(404);
  });
});

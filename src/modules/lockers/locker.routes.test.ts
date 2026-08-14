import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeClub, makeLocker } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('lockers over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app)
      .post(`/clubs/${clubId}/lockers`)
      .send({ lockerNumber: 'A14', annualRentPence: 4000 });
    expect(made.status).toBe(201);
    expect(made.body.status).toBe('vacant');

    const listed = await api(app).get(`/clubs/${clubId}/lockers`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app)
      .post(`/clubs/${clubId}/lockers`)
      .send({ lockerNumber: 'A14', annualRentPence: 4000 });
    expect(Object.keys(made.body).sort()).toEqual([
      'annualRentPence',
      'clubId',
      'createdAt',
      'id',
      'lockerNumber',
      'status',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app)
      .post(`/clubs/${clubId}/lockers`)
      .send({ lockerNumber: 'A14', annualRentPence: 4000 });
    const read = await api(app).get(`/lockers/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/lockers/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const res = await api(app)
      .post(`/clubs/${clubId}/lockers`)
      .send({ lockerNumber: 'A14', annualRentPence: 4000, nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const res = await api(app).get(`/clubs/${clubId}/lockers?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('refuses a second one with the same locker_number', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const first = await api(app)
      .post(`/clubs/${clubId}/lockers`)
      .send({ lockerNumber: 'A14', annualRentPence: 4000 });
    expect(first.status).toBe(201);

    const again = await api(app)
      .post(`/clubs/${clubId}/lockers`)
      .send({ lockerNumber: 'A14', annualRentPence: 4000 });
    expect(again.status).toBe(409);
  });

  it('amends the one field and leaves the rest alone', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app)
      .post(`/clubs/${clubId}/lockers`)
      .send({ lockerNumber: 'A14', annualRentPence: 4000 });
    const patched = await api(app)
      .patch(`/lockers/${made.body.id}`)
      .send({ annualRentPence: 4500 });
    expect(patched.status).toBe(200);
    expect(patched.body.annualRentPence).toEqual(4500);
  });

  it('refuses an empty amendment', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const made = await api(app)
      .post(`/clubs/${clubId}/lockers`)
      .send({ lockerNumber: 'A14', annualRentPence: 4000 });
    const patched = await api(app).patch(`/lockers/${made.body.id}`).send({});
    expect(patched.status).toBe(400);
  });

  it('404s when the club is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/clubs/999999/lockers')
      .send({ lockerNumber: 'A14', annualRentPence: 4000 });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);
    await makeLocker(app, { clubId });
    await makeLocker(app, { clubId });

    const all = await api(app).get(`/clubs/${clubId}/lockers`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/clubs/${clubId}/lockers?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/lockers/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);

    const res = await api(app).get(`/clubs/${clubId}/lockers?limit=0`);
    expect(res.status).toBe(400);
  });

  it('404s when amending one that is not there', async () => {
    const app = buildApp();

    const res = await api(app).patch('/lockers/999999').send({ annualRentPence: 4500 });
    expect(res.status).toBe(404);
  });
});

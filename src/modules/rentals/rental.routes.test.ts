import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeLocker, makeMember, makeRental } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('rentals over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const lockerId = await makeLocker(app);

    const made = await api(app)
      .post(`/members/${memberId}/rentals`)
      .send({ lockerId: lockerId, takenOn: '2025-04-01' });
    expect(made.status).toBe(201);
    expect(made.body.status).toBe('active');

    const listed = await api(app).get(`/members/${memberId}/rentals`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const lockerId = await makeLocker(app);

    const made = await api(app)
      .post(`/members/${memberId}/rentals`)
      .send({ lockerId: lockerId, takenOn: '2025-04-01' });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'id',
      'lockerId',
      'memberId',
      'rentPence',
      'status',
      'takenOn',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const lockerId = await makeLocker(app);

    const made = await api(app)
      .post(`/members/${memberId}/rentals`)
      .send({ lockerId: lockerId, takenOn: '2025-04-01' });
    const read = await api(app).get(`/rentals/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/rentals/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const lockerId = await makeLocker(app);

    const res = await api(app)
      .post(`/members/${memberId}/rentals`)
      .send({ lockerId: lockerId, takenOn: '2025-04-01', nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app).get(`/members/${memberId}/rentals?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the member is not there', async () => {
    const app = buildApp();
    const lockerId = await makeLocker(app);

    const res = await api(app)
      .post('/members/999999/rentals')
      .send({ lockerId: lockerId, takenOn: '2025-04-01' });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    await makeRental(app, { memberId });
    await makeRental(app, { memberId });

    const all = await api(app).get(`/members/${memberId}/rentals`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/members/${memberId}/rentals?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/rentals/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app).get(`/members/${memberId}/rentals?limit=0`);
    expect(res.status).toBe(400);
  });

  it('lets the locker on taking the rental and frees it on ending', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const lockerId = await makeLocker(app);

    const rental = await api(app)
      .post(`/members/${memberId}/rentals`)
      .send({ lockerId, takenOn: '2025-04-01' });
    expect(rental.status).toBe(201);

    const let_ = await api(app).get(`/lockers/${lockerId}`);
    expect(let_.body.status).toBe('let');

    const clash = await api(app)
      .post(`/members/${memberId}/rentals`)
      .send({ lockerId, takenOn: '2025-04-02' });
    expect(clash.status).toBe(409);

    await api(app).post(`/rentals/${rental.body.id}/end`).send({ status: 'ended' });
    const freed = await api(app).get(`/lockers/${lockerId}`);
    expect(freed.body.status).toBe('vacant');
  });
});

import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeBooking, makeMember } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('bookings over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const made = await api(app)
      .post(`/members/${memberId}/bookings`)
      .send({ onDay: '2025-06-14', teeTime: '08:40', holes: 18 });
    expect(made.status).toBe(201);
    expect(made.body.status).toBe('booked');

    const listed = await api(app).get(`/members/${memberId}/bookings`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const made = await api(app)
      .post(`/members/${memberId}/bookings`)
      .send({ onDay: '2025-06-14', teeTime: '08:40', holes: 18 });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'holes',
      'id',
      'memberId',
      'onDay',
      'status',
      'teeTime',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const made = await api(app)
      .post(`/members/${memberId}/bookings`)
      .send({ onDay: '2025-06-14', teeTime: '08:40', holes: 18 });
    const read = await api(app).get(`/bookings/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/bookings/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app)
      .post(`/members/${memberId}/bookings`)
      .send({ onDay: '2025-06-14', teeTime: '08:40', holes: 18, nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app).get(`/members/${memberId}/bookings?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the member is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/members/999999/bookings')
      .send({ onDay: '2025-06-14', teeTime: '08:40', holes: 18 });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    await makeBooking(app, { memberId });
    await makeBooking(app, { memberId });

    const all = await api(app).get(`/members/${memberId}/bookings`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/members/${memberId}/bookings?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/bookings/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app).get(`/members/${memberId}/bookings?limit=0`);
    expect(res.status).toBe(400);
  });

  it('plays a booking once and will not change it again', async () => {
    const app = buildApp();
    const bookingId = await makeBooking(app);

    const played = await api(app)
      .post(`/bookings/${bookingId}/status`)
      .send({ status: 'played' });
    expect(played.status).toBe(200);
    expect(played.body.status).toBe('played');

    const again = await api(app)
      .post(`/bookings/${bookingId}/status`)
      .send({ status: 'cancelled' });
    expect(again.status).toBe(409);
  });
});

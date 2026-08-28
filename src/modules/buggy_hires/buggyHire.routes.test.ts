import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeBooking, makeBuggyHire } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('buggy_hires over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const bookingId = await makeBooking(app);

    const made = await api(app)
      .post(`/bookings/${bookingId}/buggy-hires`)
      .send({ buggyRef: 'B3', feePence: 2500 });
    expect(made.status).toBe(201);

    const listed = await api(app).get(`/bookings/${bookingId}/buggy-hires`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const bookingId = await makeBooking(app);

    const made = await api(app)
      .post(`/bookings/${bookingId}/buggy-hires`)
      .send({ buggyRef: 'B3', feePence: 2500 });
    expect(Object.keys(made.body).sort()).toEqual([
      'bookingId',
      'buggyRef',
      'createdAt',
      'feePence',
      'id',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const bookingId = await makeBooking(app);

    const made = await api(app)
      .post(`/bookings/${bookingId}/buggy-hires`)
      .send({ buggyRef: 'B3', feePence: 2500 });
    const read = await api(app).get(`/buggy-hires/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/buggy-hires/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const bookingId = await makeBooking(app);

    const res = await api(app)
      .post(`/bookings/${bookingId}/buggy-hires`)
      .send({ buggyRef: 'B3', feePence: 2500, nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const bookingId = await makeBooking(app);

    const res = await api(app).get(`/bookings/${bookingId}/buggy-hires?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the booking is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/bookings/999999/buggy-hires')
      .send({ buggyRef: 'B3', feePence: 2500 });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const bookingId = await makeBooking(app);
    await makeBuggyHire(app, { bookingId });
    await makeBuggyHire(app, { bookingId });

    const all = await api(app).get(`/bookings/${bookingId}/buggy-hires`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/bookings/${bookingId}/buggy-hires?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/buggy-hires/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const bookingId = await makeBooking(app);

    const res = await api(app).get(`/bookings/${bookingId}/buggy-hires?limit=0`);
    expect(res.status).toBe(400);
  });

  it('will not put a buggy on a round that has been played', async () => {
    const app = buildApp();
    const bookingId = await makeBooking(app);
    await api(app).post(`/bookings/${bookingId}/status`).send({ status: 'played' });

    const res = await api(app)
      .post(`/bookings/${bookingId}/buggy-hires`)
      .send({ buggyRef: 'B3', feePence: 2500 });
    expect(res.status).toBe(409);
  });
});

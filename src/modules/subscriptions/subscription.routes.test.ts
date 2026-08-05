import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeCategory, makeMember, makeSubscription } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('subscriptions over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const categoryId = await makeCategory(app);

    const made = await api(app)
      .post(`/members/${memberId}/subscriptions`)
      .send({
        categoryId: categoryId,
        seasonStart: '2025-01-01',
        seasonEnd: '2026-01-01',
        startedOn: '2025-01-01',
      });
    expect(made.status).toBe(201);
    expect(made.body.status).toBe('active');

    const listed = await api(app).get(`/members/${memberId}/subscriptions`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const categoryId = await makeCategory(app);

    const made = await api(app)
      .post(`/members/${memberId}/subscriptions`)
      .send({
        categoryId: categoryId,
        seasonStart: '2025-01-01',
        seasonEnd: '2026-01-01',
        startedOn: '2025-01-01',
      });
    expect(Object.keys(made.body).sort()).toEqual([
      'amountPence',
      'categoryId',
      'createdAt',
      'id',
      'memberId',
      'seasonEnd',
      'seasonStart',
      'startedOn',
      'status',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const categoryId = await makeCategory(app);

    const made = await api(app)
      .post(`/members/${memberId}/subscriptions`)
      .send({
        categoryId: categoryId,
        seasonStart: '2025-01-01',
        seasonEnd: '2026-01-01',
        startedOn: '2025-01-01',
      });
    const read = await api(app).get(`/subscriptions/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/subscriptions/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const categoryId = await makeCategory(app);

    const res = await api(app)
      .post(`/members/${memberId}/subscriptions`)
      .send({
        categoryId: categoryId,
        seasonStart: '2025-01-01',
        seasonEnd: '2026-01-01',
        startedOn: '2025-01-01',
        nonesuch: 1,
      });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app).get(`/members/${memberId}/subscriptions?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the member is not there', async () => {
    const app = buildApp();
    const categoryId = await makeCategory(app);

    const res = await api(app)
      .post('/members/999999/subscriptions')
      .send({
        categoryId: categoryId,
        seasonStart: '2025-01-01',
        seasonEnd: '2026-01-01',
        startedOn: '2025-01-01',
      });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    await makeSubscription(app, { memberId });
    await makeSubscription(app, { memberId });

    const all = await api(app).get(`/members/${memberId}/subscriptions`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/members/${memberId}/subscriptions?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/subscriptions/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app).get(`/members/${memberId}/subscriptions?limit=0`);
    expect(res.status).toBe(400);
  });

  it('charges a full year to a member who joins on day one', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    // 73000 a year over a 365-day season is 200 a day
    const category = await api(app)
      .post('/categories')
      .send({ code: 'FULLX', name: 'Full', annualRatePence: 73000 });

    const sub = await api(app).post(`/members/${memberId}/subscriptions`).send({
      categoryId: category.body.id,
      seasonStart: '2025-01-01',
      seasonEnd: '2026-01-01',
      startedOn: '2025-01-01',
    });
    expect(sub.status).toBe(201);
    expect(sub.body.amountPence).toBe(73000);
  });

  it('apportions the subscription for a member who joins midway', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const category = await api(app)
      .post('/categories')
      .send({ code: 'FULLY', name: 'Full', annualRatePence: 73000 });

    // 1 July to 1 Jan is 184 days at 200 a day = 36800
    const sub = await api(app).post(`/members/${memberId}/subscriptions`).send({
      categoryId: category.body.id,
      seasonStart: '2025-01-01',
      seasonEnd: '2026-01-01',
      startedOn: '2025-07-01',
    });
    expect(sub.status).toBe(201);
    expect(sub.body.amountPence).toBe(36800);
  });

  it('refuses cover that starts outside the season', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const category = await api(app)
      .post('/categories')
      .send({ code: 'FULLZ', name: 'Full', annualRatePence: 73000 });

    const res = await api(app).post(`/members/${memberId}/subscriptions`).send({
      categoryId: category.body.id,
      seasonStart: '2025-01-01',
      seasonEnd: '2026-01-01',
      startedOn: '2024-12-15',
    });
    expect(res.status).toBe(400);
  });
});

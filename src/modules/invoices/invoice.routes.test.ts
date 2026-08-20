import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeCategory, makeClub, makeInvoice, makeMember } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('invoices over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const categoryId = await makeCategory(app, { annualRatePence: 73000 });
    await api(app).post(`/members/${memberId}/subscriptions`).send({
      categoryId,
      seasonStart: '2025-01-01',
      seasonEnd: '2026-01-01',
      startedOn: '2025-01-01',
    });

    const made = await api(app)
      .post('/invoices')
      .send({ memberId: memberId, number: 'GINV-1000', raisedOn: '2025-06-02' });
    expect(made.status).toBe(201);

    const listed = await api(app).get('/invoices');
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const categoryId = await makeCategory(app, { annualRatePence: 73000 });
    await api(app).post(`/members/${memberId}/subscriptions`).send({
      categoryId,
      seasonStart: '2025-01-01',
      seasonEnd: '2026-01-01',
      startedOn: '2025-01-01',
    });

    const made = await api(app)
      .post('/invoices')
      .send({ memberId: memberId, number: 'GINV-1000', raisedOn: '2025-06-02' });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'entriesPence',
      'grossPence',
      'id',
      'lessonsPence',
      'memberId',
      'netPence',
      'number',
      'raisedOn',
      'subscriptionPence',
      'updatedAt',
      'vatPence',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const categoryId = await makeCategory(app, { annualRatePence: 73000 });
    await api(app).post(`/members/${memberId}/subscriptions`).send({
      categoryId,
      seasonStart: '2025-01-01',
      seasonEnd: '2026-01-01',
      startedOn: '2025-01-01',
    });

    const made = await api(app)
      .post('/invoices')
      .send({ memberId: memberId, number: 'GINV-1000', raisedOn: '2025-06-02' });
    const read = await api(app).get(`/invoices/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/invoices/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
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
      .send({ memberId: memberId, number: 'GINV-1000', raisedOn: '2025-06-02', nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();

    const res = await api(app).get('/invoices?nonesuch=1');
    expect(res.status).toBe(400);
  });

  it('refuses a second one with the same number', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const categoryId = await makeCategory(app, { annualRatePence: 73000 });
    await api(app).post(`/members/${memberId}/subscriptions`).send({
      categoryId,
      seasonStart: '2025-01-01',
      seasonEnd: '2026-01-01',
      startedOn: '2025-01-01',
    });

    const first = await api(app)
      .post('/invoices')
      .send({ memberId: memberId, number: 'GINV-1000', raisedOn: '2025-06-02' });
    expect(first.status).toBe(201);

    const again = await api(app)
      .post('/invoices')
      .send({ memberId: memberId, number: 'GINV-1000', raisedOn: '2025-06-02' });
    expect(again.status).toBe(409);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    await makeInvoice(app);
    await makeInvoice(app);

    const all = await api(app).get('/invoices');
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get('/invoices?limit=1');
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/invoices/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();

    const res = await api(app).get('/invoices?limit=0');
    expect(res.status).toBe(400);
  });

  it('adds up the subscription, lessons and entries, and takes VAT', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const clubId = await makeClub(app);

    const category = await api(app)
      .post('/categories')
      .send({ code: 'INV1', name: 'Full', annualRatePence: 73000 });
    await api(app).post(`/members/${memberId}/subscriptions`).send({
      categoryId: category.body.id,
      seasonStart: '2025-01-01',
      seasonEnd: '2026-01-01',
      startedOn: '2025-01-01',
    });

    const pro = await api(app)
      .post(`/clubs/${clubId}/staff`)
      .send({
        payrollNumber: 'IP',
        name: 'Pro',
        role: 'professional',
        startedOn: '2016-02-01',
      });
    await api(app)
      .post(`/members/${memberId}/lessons`)
      .send({ proId: pro.body.id, onDay: '2025-05-10', minutes: 30, ratePence: 6000 });

    const comp = await api(app).post(`/clubs/${clubId}/competitions`).send({
      name: 'Open',
      onDay: '2025-06-01',
      format: 'medal',
      entryFeePence: 1500,
    });
    await api(app).post(`/competitions/${comp.body.id}/entries`).send({ memberId });

    const raised = await api(app)
      .post('/invoices')
      .send({ memberId, number: 'GINV-1', raisedOn: '2025-06-02' });

    expect(raised.status).toBe(201);
    expect(raised.body.subscriptionPence).toBe(73000);
    expect(raised.body.lessonsPence).toBe(3000);
    expect(raised.body.entriesPence).toBe(1500);
    expect(raised.body.netPence).toBe(77500);
    expect(raised.body.vatPence).toBe(15500);
    expect(raised.body.grossPence).toBe(93000);
  });

  it('invoices a member once', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const first = await api(app)
      .post('/invoices')
      .send({ memberId, number: 'GINV-2', raisedOn: '2025-06-02' });
    expect(first.status).toBe(201);

    const again = await api(app)
      .post('/invoices')
      .send({ memberId, number: 'GINV-3', raisedOn: '2025-06-02' });
    expect(again.status).toBe(409);
  });

  it('404s for a member that is not there', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/invoices')
      .send({ memberId: 999999, number: 'GINV-4', raisedOn: '2025-06-02' });
    expect(res.status).toBe(404);
  });
});

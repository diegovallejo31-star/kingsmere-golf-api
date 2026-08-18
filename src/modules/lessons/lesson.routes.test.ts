import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeClub, makeLesson, makeMember, makeStaffMember } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('lessons over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const proId = await makeStaffMember(app);

    const made = await api(app)
      .post(`/members/${memberId}/lessons`)
      .send({ proId: proId, onDay: '2025-05-10', minutes: 30, ratePence: 6000 });
    expect(made.status).toBe(201);

    const listed = await api(app).get(`/members/${memberId}/lessons`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const proId = await makeStaffMember(app);

    const made = await api(app)
      .post(`/members/${memberId}/lessons`)
      .send({ proId: proId, onDay: '2025-05-10', minutes: 30, ratePence: 6000 });
    expect(Object.keys(made.body).sort()).toEqual([
      'chargePence',
      'createdAt',
      'id',
      'memberId',
      'minutes',
      'onDay',
      'proId',
      'ratePence',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const proId = await makeStaffMember(app);

    const made = await api(app)
      .post(`/members/${memberId}/lessons`)
      .send({ proId: proId, onDay: '2025-05-10', minutes: 30, ratePence: 6000 });
    const read = await api(app).get(`/lessons/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/lessons/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const proId = await makeStaffMember(app);

    const res = await api(app)
      .post(`/members/${memberId}/lessons`)
      .send({ proId: proId, onDay: '2025-05-10', minutes: 30, ratePence: 6000, nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app).get(`/members/${memberId}/lessons?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the member is not there', async () => {
    const app = buildApp();
    const proId = await makeStaffMember(app);

    const res = await api(app)
      .post('/members/999999/lessons')
      .send({ proId: proId, onDay: '2025-05-10', minutes: 30, ratePence: 6000 });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    await makeLesson(app, { memberId });
    await makeLesson(app, { memberId });

    const all = await api(app).get(`/members/${memberId}/lessons`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/members/${memberId}/lessons?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/lessons/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app).get(`/members/${memberId}/lessons?limit=0`);
    expect(res.status).toBe(400);
  });

  it('charges the pro rate for the minutes taught', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const clubId = await makeClub(app);
    const pro = await api(app).post(`/clubs/${clubId}/staff`).send({
      payrollNumber: 'P1',
      name: 'D. Aird',
      role: 'professional',
      startedOn: '2016-02-01',
    });

    // 30 minutes at 6000 an hour = 3000
    const lesson = await api(app)
      .post(`/members/${memberId}/lessons`)
      .send({ proId: pro.body.id, onDay: '2025-05-10', minutes: 30, ratePence: 6000 });
    expect(lesson.status).toBe(201);
    expect(lesson.body.chargePence).toBe(3000);
  });

  it('will not book a lesson with staff who are not a professional', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);
    const clubId = await makeClub(app);
    const steward = await api(app)
      .post(`/clubs/${clubId}/staff`)
      .send({ payrollNumber: 'P2', name: 'B. Steward', role: 'bar', startedOn: '2019-01-01' });

    const res = await api(app)
      .post(`/members/${memberId}/lessons`)
      .send({ proId: steward.body.id, onDay: '2025-05-10', minutes: 30, ratePence: 6000 });
    expect(res.status).toBe(409);
  });
});

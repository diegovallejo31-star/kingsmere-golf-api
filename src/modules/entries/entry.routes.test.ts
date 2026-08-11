import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeClub, makeCompetition, makeEntry, makeMember } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('entries over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();
    const competitionId = await makeCompetition(app);
    const memberId = await makeMember(app);

    const made = await api(app)
      .post(`/competitions/${competitionId}/entries`)
      .send({ memberId: memberId });
    expect(made.status).toBe(201);
    expect(made.body.status).toBe('entered');

    const listed = await api(app).get(`/competitions/${competitionId}/entries`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();
    const competitionId = await makeCompetition(app);
    const memberId = await makeMember(app);

    const made = await api(app)
      .post(`/competitions/${competitionId}/entries`)
      .send({ memberId: memberId });
    expect(Object.keys(made.body).sort()).toEqual([
      'competitionId',
      'createdAt',
      'feePence',
      'id',
      'memberId',
      'status',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();
    const competitionId = await makeCompetition(app);
    const memberId = await makeMember(app);

    const made = await api(app)
      .post(`/competitions/${competitionId}/entries`)
      .send({ memberId: memberId });
    const read = await api(app).get(`/entries/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/entries/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();
    const competitionId = await makeCompetition(app);
    const memberId = await makeMember(app);

    const res = await api(app)
      .post(`/competitions/${competitionId}/entries`)
      .send({ memberId: memberId, nonesuch: 1 });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();
    const competitionId = await makeCompetition(app);

    const res = await api(app).get(`/competitions/${competitionId}/entries?nonesuch=1`);
    expect(res.status).toBe(400);
  });

  it('404s when the competition is not there', async () => {
    const app = buildApp();
    const memberId = await makeMember(app);

    const res = await api(app)
      .post('/competitions/999999/entries')
      .send({ memberId: memberId });
    expect(res.status).toBe(404);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    const competitionId = await makeCompetition(app);
    await makeEntry(app, { competitionId });
    await makeEntry(app, { competitionId });

    const all = await api(app).get(`/competitions/${competitionId}/entries`);
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get(`/competitions/${competitionId}/entries?limit=1`);
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/entries/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();
    const competitionId = await makeCompetition(app);

    const res = await api(app).get(`/competitions/${competitionId}/entries?limit=0`);
    expect(res.status).toBe(400);
  });

  it('charges the competition fee and refuses a second entry for the same member', async () => {
    const app = buildApp();
    const clubId = await makeClub(app);
    const competition = await api(app).post(`/clubs/${clubId}/competitions`).send({
      name: 'Spring Medal',
      onDay: '2025-05-04',
      format: 'medal',
      entryFeePence: 1500,
    });
    const memberId = await makeMember(app);

    const first = await api(app)
      .post(`/competitions/${competition.body.id}/entries`)
      .send({ memberId });
    expect(first.status).toBe(201);
    expect(first.body.feePence).toBe(1500);

    const again = await api(app)
      .post(`/competitions/${competition.body.id}/entries`)
      .send({ memberId });
    expect(again.status).toBe(409);
  });

  it('withdraws an entry once', async () => {
    const app = buildApp();
    const entryId = await makeEntry(app);

    const withdrawn = await api(app)
      .post(`/entries/${entryId}/withdraw`)
      .send({ status: 'withdrawn' });
    expect(withdrawn.status).toBe(200);
    expect(withdrawn.body.status).toBe('withdrawn');

    const again = await api(app)
      .post(`/entries/${entryId}/withdraw`)
      .send({ status: 'withdrawn' });
    expect(again.status).toBe(409);
  });
});

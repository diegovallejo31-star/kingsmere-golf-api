import type { Express } from 'express';
import { createApp } from '../../app';
import { api } from '../../../tests/apiClient';
import { createTestDb } from '../../../tests/testDb';
import { makeMember } from '../../../tests/factories';

function buildApp(): Express {
  return createApp(createTestDb());
}

describe('members over the wire', () => {
  it('takes a new one and lists it back', async () => {
    const app = buildApp();

    const made = await api(app)
      .post('/members')
      .send({ memberRef: 'M-0071', name: 'Eleanor Frost', joinedOn: '2021-04-01' });
    expect(made.status).toBe(201);

    const listed = await api(app).get('/members');
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);
  });

  it('answers one with exactly the fields it promises', async () => {
    const app = buildApp();

    const made = await api(app)
      .post('/members')
      .send({ memberRef: 'M-0071', name: 'Eleanor Frost', joinedOn: '2021-04-01' });
    expect(Object.keys(made.body).sort()).toEqual([
      'createdAt',
      'email',
      'id',
      'joinedOn',
      'memberRef',
      'name',
      'updatedAt',
    ]);
  });

  it('reads one back by its id, and 404s for one that is not there', async () => {
    const app = buildApp();

    const made = await api(app)
      .post('/members')
      .send({ memberRef: 'M-0071', name: 'Eleanor Frost', joinedOn: '2021-04-01' });
    const read = await api(app).get(`/members/${made.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(made.body.id);

    const missing = await api(app).get('/members/999999');
    expect(missing.status).toBe(404);
  });

  it('turns down a body carrying a field it does not know', async () => {
    const app = buildApp();

    const res = await api(app)
      .post('/members')
      .send({
        memberRef: 'M-0071',
        name: 'Eleanor Frost',
        joinedOn: '2021-04-01',
        nonesuch: 1,
      });
    expect(res.status).toBe(400);
  });

  it('turns down a query it does not know', async () => {
    const app = buildApp();

    const res = await api(app).get('/members?nonesuch=1');
    expect(res.status).toBe(400);
  });

  it('refuses a second one with the same member_ref', async () => {
    const app = buildApp();

    const first = await api(app)
      .post('/members')
      .send({ memberRef: 'M-0071', name: 'Eleanor Frost', joinedOn: '2021-04-01' });
    expect(first.status).toBe(201);

    const again = await api(app)
      .post('/members')
      .send({ memberRef: 'M-0071', name: 'Eleanor Frost', joinedOn: '2021-04-01' });
    expect(again.status).toBe(409);
  });

  it('amends the one field and leaves the rest alone', async () => {
    const app = buildApp();

    const made = await api(app)
      .post('/members')
      .send({ memberRef: 'M-0071', name: 'Eleanor Frost', joinedOn: '2021-04-01' });
    const patched = await api(app)
      .patch(`/members/${made.body.id}`)
      .send({ email: 'e.frost@example.test' });
    expect(patched.status).toBe(200);
    expect(patched.body.email).toEqual('e.frost@example.test');
  });

  it('refuses an empty amendment', async () => {
    const app = buildApp();

    const made = await api(app)
      .post('/members')
      .send({ memberRef: 'M-0071', name: 'Eleanor Frost', joinedOn: '2021-04-01' });
    const patched = await api(app).patch(`/members/${made.body.id}`).send({});
    expect(patched.status).toBe(400);
  });

  it('gives back only as many as were asked for', async () => {
    const app = buildApp();
    await makeMember(app);
    await makeMember(app);

    const all = await api(app).get('/members');
    expect(all.body.items).toHaveLength(2);

    const one = await api(app).get('/members?limit=1');
    expect(one.body.items).toHaveLength(1);
  });

  it('turns down an id that is not a number', async () => {
    const app = buildApp();

    const res = await api(app).get('/members/not-an-id');
    expect(res.status).toBe(400);
  });

  it('turns down a page size of nothing', async () => {
    const app = buildApp();

    const res = await api(app).get('/members?limit=0');
    expect(res.status).toBe(400);
  });

  it('404s when amending one that is not there', async () => {
    const app = buildApp();

    const res = await api(app).patch('/members/999999').send({ email: 'e.frost@example.test' });
    expect(res.status).toBe(404);
  });
});

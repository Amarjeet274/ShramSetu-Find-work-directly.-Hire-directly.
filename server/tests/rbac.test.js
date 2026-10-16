const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');

const mkToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('RBAC', () => {
  test('worker cannot POST /api/jobs', async () => {
    const w = await User.create({ phone: '9876543211', role: 'worker', isVerified: true });
    const token = mkToken(w._id);
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'x' });
    expect(res.status).toBe(403);
  });

  test('non-admin cannot access /api/admin/users', async () => {
    const w = await User.create({ phone: '9876543212', role: 'worker', isVerified: true });
    const token = mkToken(w._id);
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
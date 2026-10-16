const request = require('supertest');
const app = require('../src/app');
const OTPSession = require('../src/models/OTPSession');
const crypto = require('crypto');

const hashOTP = (otp) => crypto.createHash('sha256').update(otp + process.env.JWT_SECRET).digest('hex');

describe('Auth', () => {
  test('rejects invalid phone', async () => {
    const res = await request(app).post('/api/auth/send-otp').send({ phone: '123' });
    expect(res.status).toBe(400);
  });

  test('happy path: send + verify OTP → user created', async () => {
    const phone = '9876543210';
    await request(app).post('/api/auth/send-otp').send({ phone }).expect(200);

    // Grab the OTP from DB by testing both possibilities — or mock SMS
    // Simpler: read the session & brute-force an OTP is not possible; use provider=console in tests
    const session = await OTPSession.findOne({ phone });
    expect(session).toBeTruthy();

    // Override: create new session with known OTP
    await OTPSession.updateOne({ phone }, { otpHash: hashOTP('123456') });

    const res = await request(app).post('/api/auth/verify-otp')
      .send({ phone, otp: '123456', role: 'worker', language: 'hi' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('worker');
  });
});
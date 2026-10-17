import request from 'supertest';
import express from 'express';
import { createRateLimiter } from '../middleware/rateLimiter';
import { requireApiKey } from '../middleware/auth';

describe('Rate Limiter & Auth Middleware', () => {
  describe('Rate Limiter', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      const testLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 3,
        message: 'Rate limit test hit'
      });
      app.use(testLimiter);
      app.get('/test', (_req, res) => res.json({ ok: true }));
    });

    it('should allow requests under the limit and set rate limit headers', async () => {
      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
      expect(res.headers['x-ratelimit-limit']).toBe('3');
      expect(res.headers['x-ratelimit-remaining']).toBe('2');
      expect(res.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should reject requests exceeding limit with 429 status', async () => {
      await request(app).get('/test'); // 1
      await request(app).get('/test'); // 2
      await request(app).get('/test'); // 3

      const blockedRes = await request(app).get('/test'); // 4
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body.success).toBe(false);
      expect(blockedRes.body.error.message).toBe('Rate limit test hit');
      expect(blockedRes.headers['x-ratelimit-remaining']).toBe('0');
    });
  });

  describe('API Key Authentication', () => {
    let app: express.Application;

    beforeEach(() => {
      app = express();
      app.get('/protected', requireApiKey as any, (req: any, res) => {
        res.json({ ok: true, user: req.user });
      });
    });

    it('should return 401 when no api key is provided', async () => {
      const res = await request(app).get('/protected');
      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain('Missing API key');
    });

    it('should return 403 when an invalid api key is provided', async () => {
      const res = await request(app)
        .get('/protected')
        .set('X-API-Key', 'invalid-key');
      expect(res.status).toBe(403);
      expect(res.body.error.message).toContain('Invalid or revoked');
    });

    it('should allow access with valid api key and set req.user', async () => {
      const res = await request(app)
        .get('/protected')
        .set('X-API-Key', 'test-api-key-admin');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.user.role).toBe('admin');
    });
  });
});

import request from 'supertest';
import { createApp } from '../app';
import { InMemoryDatabase } from '../store/database';
import { safeCompare, escapeRegex } from '../utils/cryptoSecurity';

describe('Security & Validation Hardening', () => {
  let app: any;
  let db: InMemoryDatabase;

  beforeEach(() => {
    db = InMemoryDatabase.getInstance();
    db.reset();
    app = createApp();
  });

  describe('Constant-Time Comparison (safeCompare)', () => {
    it('should correctly compare identical strings', () => {
      expect(safeCompare('secret_token_123', 'secret_token_123')).toBe(true);
    });

    it('should return false for different strings and lengths', () => {
      expect(safeCompare('secret_token_123', 'secret_token_456')).toBe(false);
      expect(safeCompare('short', 'longer_string')).toBe(false);
    });
  });

  describe('ReDoS and Regex Escaping', () => {
    it('should escape special regex characters safely', () => {
      const raw = 'user(name)?+.*[test]';
      const escaped = escapeRegex(raw);
      expect(escaped).toBe('user\\(name\\)\\?\\+\\.\\*\\[test\\]');
    });

    it('should handle search queries containing regex operators without crashing', async () => {
      const res = await request(app).get('/api/v1/tasks?search=(.*)+test');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Input Validation & Sanitization', () => {
    it('should sanitize HTML / XSS payloads in title and description', async () => {
      const res = await request(app).post('/api/v1/tasks').send({
        title: '<script>alert(1)</script>Safe Title',
        description: '<img src=x onerror=alert(1)>'
      });

      expect(res.status).toBe(201);
      expect(res.body.data.title).not.toContain('<script>');
      expect(res.body.data.title).toContain('&lt;script&gt;');
      expect(res.body.data.description).toContain('&lt;img');
    });

    it('should reject invalid priority enum values', async () => {
      const res = await request(app).post('/api/v1/tasks').send({
        title: 'Valid Title',
        priority: 'SUPER_URGENT' // invalid
      });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Invalid priority');
    });

    it('should reject update with empty whitespace title', async () => {
      const res = await request(app).put('/api/v1/tasks/tsk-1').send({
        title: '   '
      });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('must be a non-empty string');
    });
  });
});

import request from 'supertest';
import { createApp } from '../app';
import { InMemoryDatabase } from '../store/database';

describe('TaskFlow API Endpoints', () => {
  let app: any;
  let db: InMemoryDatabase;

  beforeEach(() => {
    db = InMemoryDatabase.getInstance();
    db.reset();
    app = createApp();
  });

  describe('GET /health', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should return all tasks', async () => {
      const res = await request(app).get('/api/v1/tasks');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app).get('/api/v1/tasks?status=COMPLETED');
      expect(res.status).toBe(200);
      expect(res.body.data.every((t: any) => t.status === 'COMPLETED')).toBe(true);
    });
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task with valid payload', async () => {
      const payload = {
        title: 'New Feature Implementation',
        description: 'Implement core functionality for v1',
        priority: 'HIGH',
        tags: ['feature', 'core']
      };

      const res = await request(app).post('/api/v1/tasks').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(payload.title);
      expect(res.body.data.status).toBe('TODO');
      expect(res.body.data.id).toBeDefined();
    });

    it('should reject task creation without title', async () => {
      const res = await request(app).post('/api/v1/tasks').send({ description: 'No title' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('title is required');
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should update task status', async () => {
      const res = await request(app)
        .put('/api/v1/tasks/tsk-1')
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('should return 404 when updating non-existent task', async () => {
      const res = await request(app)
        .put('/api/v1/tasks/tsk-999')
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete existing task', async () => {
      const res = await request(app).delete('/api/v1/tasks/tsk-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const fetchRes = await request(app).get('/api/v1/tasks/tsk-1');
      expect(fetchRes.status).toBe(404);
    });
  });
});

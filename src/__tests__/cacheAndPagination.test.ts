import request from 'supertest';
import { createApp } from '../app';
import { InMemoryDatabase } from '../store/database';
import { CacheService } from '../services/cacheService';

describe('Event-Driven Caching and Pagination', () => {
  let app: any;
  let db: InMemoryDatabase;
  let cache: CacheService;

  beforeEach(() => {
    db = InMemoryDatabase.getInstance();
    db.reset();
    cache = CacheService.getInstance();
    cache.clear();
    app = createApp();
  });

  describe('Pagination', () => {
    beforeEach(() => {
      // Seed 15 tasks
      for (let i = 1; i <= 15; i++) {
        db.insertTask({
          id: `tsk-seed-${i}`,
          title: `Task number ${i}`,
          description: `Description ${i}`,
          status: 'TODO',
          priority: 'MEDIUM',
          tags: ['seed'],
          createdAt: new Date(Date.now() - i * 1000),
          updatedAt: new Date()
        });
      }
    });

    it('should paginate results with default limit', async () => {
      const res = await request(app).get('/api/v1/tasks?limit=5&page=1');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(5);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.hasNextPage).toBe(true);
      expect(res.body.pagination.hasPrevPage).toBe(false);
    });

    it('should fetch second page correctly', async () => {
      const res = await request(app).get('/api/v1/tasks?limit=5&page=2');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(5);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.hasPrevPage).toBe(true);
    });
  });

  describe('Cache & Event Invalidation', () => {
    it('should serve cached response on repeated calls', async () => {
      const firstRes = await request(app).get('/api/v1/tasks');
      expect(firstRes.status).toBe(200);

      const statsBefore = cache.getStats();
      expect(statsBefore.misses).toBeGreaterThanOrEqual(1);

      // Second request should hit cache
      const secondRes = await request(app).get('/api/v1/tasks');
      expect(secondRes.status).toBe(200);
      const statsAfter = cache.getStats();
      expect(statsAfter.hits).toBeGreaterThan(0);
    });

    it('should invalidate cache when a new task is created', async () => {
      await request(app).get('/api/v1/tasks');
      const stats1 = cache.getStats();

      // Create new task (triggers event emitter -> invalidates cache)
      await request(app).post('/api/v1/tasks').send({
        title: 'Cache Invalidation Verification Task'
      });

      // Subsequent query should miss cache and fetch updated data
      const res = await request(app).get('/api/v1/tasks');
      expect(res.body.data.some((t: any) => t.title === 'Cache Invalidation Verification Task')).toBe(true);
    });
  });
});

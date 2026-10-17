import express, { Application } from 'express';
import cors from 'cors';
import { createTaskRouter } from './routes/taskRoutes';
import { errorHandler } from './middleware/errorHandler';
import { createRateLimiter } from './middleware/rateLimiter';
import { requireApiKey } from './middleware/auth';

export interface AppOptions {
  enableRateLimiting?: boolean;
  enableAuth?: boolean;
}

export const createApp = (options?: AppOptions): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Global rate limiter (100 requests per minute)
  if (options?.enableRateLimiting ?? true) {
    const limiter = createRateLimiter({
      windowMs: 60 * 1000,
      maxRequests: 100,
      message: 'API rate limit exceeded. Please try again after 60 seconds.'
    });
    app.use(limiter);
  }

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  const taskRouter = createTaskRouter();
  if (options?.enableAuth) {
    app.use('/api/v1/tasks', requireApiKey as any, taskRouter);
  } else {
    app.use('/api/v1/tasks', taskRouter);
  }

  app.use(errorHandler);

  return app;
};

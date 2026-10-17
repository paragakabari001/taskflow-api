import express, { Application } from 'express';
import cors from 'cors';
import { createTaskRouter } from './routes/taskRoutes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.use('/api/v1/tasks', createTaskRouter());

  app.use(errorHandler);

  return app;
};

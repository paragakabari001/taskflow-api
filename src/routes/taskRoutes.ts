import { Router } from 'express';
import { TaskController } from '../controllers/taskController';

export const createTaskRouter = (controller?: TaskController): Router => {
  const router = Router();
  const taskController = controller || new TaskController();

  router.get('/', taskController.getTasks);
  router.get('/:id', taskController.getTaskById);
  router.post('/', taskController.createTask);
  router.put('/:id', taskController.updateTask);
  router.delete('/:id', taskController.deleteTask);

  return router;
};

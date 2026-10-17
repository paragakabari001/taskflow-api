import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { validateCreateTask, validateUpdateTask } from '../middleware/validator';

export const createTaskRouter = (controller?: TaskController): Router => {
  const router = Router();
  const taskController = controller || new TaskController();

  router.get('/', taskController.getTasks);
  router.get('/:id', taskController.getTaskById);
  router.post('/', validateCreateTask, taskController.createTask);
  router.put('/:id', validateUpdateTask, taskController.updateTask);
  router.delete('/:id', taskController.deleteTask);

  return router;
};

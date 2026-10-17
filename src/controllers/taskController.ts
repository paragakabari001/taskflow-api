import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { TaskFilterOptions, TaskPriority, TaskStatus } from '../types/task';

export class TaskController {
  private taskService: TaskService;

  constructor(taskService?: TaskService) {
    this.taskService = taskService || new TaskService();
  }

  public getTasks = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const filter: TaskFilterOptions = {
        status: req.query.status as TaskStatus,
        priority: req.query.priority as TaskPriority,
        assignedTo: req.query.assignedTo as string,
        search: req.query.search as string
      };

      const tasks = this.taskService.listTasks(filter);
      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (err) {
      next(err);
    }
  };

  public getTaskById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const task = this.taskService.getTaskById(id);
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  };

  public createTask = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const task = this.taskService.createTask(req.body);
      res.status(201).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  };

  public updateTask = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      const task = this.taskService.updateTask(id, req.body);
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (err) {
      next(err);
    }
  };

  public deleteTask = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      this.taskService.deleteTask(id);
      res.status(200).json({
        success: true,
        message: `Task ${id} deleted successfully`
      });
    } catch (err) {
      next(err);
    }
  };
}

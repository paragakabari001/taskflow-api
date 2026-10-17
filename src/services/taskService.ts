import { InMemoryDatabase } from '../store/database';
import { CreateTaskDTO, Task, TaskFilterOptions, UpdateTaskDTO } from '../types/task';
import crypto from 'crypto';

export class TaskService {
  private db: InMemoryDatabase;

  constructor(db?: InMemoryDatabase) {
    this.db = db || InMemoryDatabase.getInstance();
  }

  public listTasks(filter?: TaskFilterOptions): Task[] {
    return this.db.getAllTasks(filter);
  }

  public getTaskById(id: string): Task {
    const task = this.db.getTaskById(id);
    if (!task) {
      const error: any = new Error(`Task with id '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  public createTask(dto: CreateTaskDTO): Task {
    if (!dto.title || dto.title.trim().length === 0) {
      const error: any = new Error('Task title is required');
      error.statusCode = 400;
      throw error;
    }

    if (dto.assignedTo) {
      const user = this.db.getUserById(dto.assignedTo);
      if (!user) {
        const error: any = new Error(`Assigned user '${dto.assignedTo}' does not exist`);
        error.statusCode = 400;
        throw error;
      }
    }

    const newTask: Task = {
      id: `tsk-${crypto.randomUUID().slice(0, 8)}`,
      title: dto.title.trim(),
      description: dto.description || '',
      status: 'TODO',
      priority: dto.priority || 'MEDIUM',
      assignedTo: dto.assignedTo,
      dueDate: dto.dueDate,
      tags: dto.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.db.insertTask(newTask);
  }

  public updateTask(id: string, dto: UpdateTaskDTO): Task {
    // Verify existence first
    this.getTaskById(id);

    if (dto.assignedTo) {
      const user = this.db.getUserById(dto.assignedTo);
      if (!user) {
        const error: any = new Error(`Assigned user '${dto.assignedTo}' does not exist`);
        error.statusCode = 400;
        throw error;
      }
    }

    const updated = this.db.updateTask(id, dto);
    if (!updated) {
      const error: any = new Error(`Task with id '${id}' could not be updated`);
      error.statusCode = 500;
      throw error;
    }

    return updated;
  }

  public deleteTask(id: string): void {
    this.getTaskById(id);
    this.db.deleteTask(id);
  }
}

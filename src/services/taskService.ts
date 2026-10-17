import { InMemoryDatabase } from '../store/database';
import { CreateTaskDTO, PaginatedResult, Task, TaskFilterOptions, UpdateTaskDTO } from '../types/task';
import { CacheService } from './cacheService';
import { TaskEventEmitter } from '../events/taskEvents';
import crypto from 'crypto';

export class TaskService {
  private db: InMemoryDatabase;
  private cache: CacheService;
  private events: TaskEventEmitter;

  constructor(db?: InMemoryDatabase, cache?: CacheService, events?: TaskEventEmitter) {
    this.db = db || InMemoryDatabase.getInstance();
    this.cache = cache || CacheService.getInstance();
    this.events = events || TaskEventEmitter.getInstance();
  }

  public listTasks(filter?: TaskFilterOptions): PaginatedResult<Task> {
    const page = Math.max(1, Number(filter?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter?.limit) || 10));

    const cacheKey = `tasks:${JSON.stringify(filter || {})}:p${page}:l${limit}`;
    const cached = this.cache.get<PaginatedResult<Task>>(cacheKey);
    if (cached) {
      return cached;
    }

    const allTasks = this.db.getAllTasks(filter);
    const totalCount = allTasks.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedData = allTasks.slice(startIndex, startIndex + limit);

    const result: PaginatedResult<Task> = {
      data: paginatedData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    this.cache.set(cacheKey, result, 30); // 30s TTL
    return result;
  }

  public getTaskById(id: string): Task {
    const cacheKey = `task:${id}`;
    const cached = this.cache.get<Task>(cacheKey);
    if (cached) {
      return cached;
    }

    const task = this.db.getTaskById(id);
    if (!task) {
      const error: any = new Error(`Task with id '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    this.cache.set(cacheKey, task, 60);
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

    const created = this.db.insertTask(newTask);
    this.events.emitTaskCreated(created);
    return created;
  }

  public updateTask(id: string, dto: UpdateTaskDTO): Task {
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

    this.events.emitTaskUpdated(updated);
    return updated;
  }

  public deleteTask(id: string): void {
    this.getTaskById(id);
    this.db.deleteTask(id);
    this.events.emitTaskDeleted(id);
  }
}

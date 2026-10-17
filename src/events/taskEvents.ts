import { EventEmitter } from 'events';
import { Task } from '../types/task';
import { CacheService } from '../services/cacheService';

export class TaskEventEmitter extends EventEmitter {
  private static instance: TaskEventEmitter;

  private constructor() {
    super();
    this.registerInternalListeners();
  }

  public static getInstance(): TaskEventEmitter {
    if (!TaskEventEmitter.instance) {
      TaskEventEmitter.instance = new TaskEventEmitter();
    }
    return TaskEventEmitter.instance;
  }

  private registerInternalListeners(): void {
    const cache = CacheService.getInstance();

    // Auto invalidate cache on task lifecycle changes
    this.on('task:created', (task: Task) => {
      cache.invalidatePattern('^tasks:');
    });

    this.on('task:updated', (task: Task) => {
      cache.delete(`task:${task.id}`);
      cache.invalidatePattern('^tasks:');
    });

    this.on('task:deleted', (taskId: string) => {
      cache.delete(`task:${taskId}`);
      cache.invalidatePattern('^tasks:');
    });
  }

  public emitTaskCreated(task: Task): void {
    this.emit('task:created', task);
  }

  public emitTaskUpdated(task: Task): void {
    this.emit('task:updated', task);
  }

  public emitTaskDeleted(taskId: string): void {
    this.emit('task:deleted', taskId);
  }
}

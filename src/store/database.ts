import { Task, User, TaskFilterOptions } from '../types/task';
import { escapeRegex } from '../utils/cryptoSecurity';

export class InMemoryDatabase {
  private static instance: InMemoryDatabase;
  private tasks: Map<string, Task> = new Map();
  private users: Map<string, User> = new Map();

  private constructor() {
    this.seedDefaultData();
  }

  public static getInstance(): InMemoryDatabase {
    if (!InMemoryDatabase.instance) {
      InMemoryDatabase.instance = new InMemoryDatabase();
    }
    return InMemoryDatabase.instance;
  }

  private seedDefaultData(): void {
    const defaultUser: User = {
      id: 'usr-1',
      name: 'Default Admin',
      email: 'admin@taskflow.dev',
      role: 'admin',
      createdAt: new Date()
    };
    this.users.set(defaultUser.id, defaultUser);

    const defaultTask: Task = {
      id: 'tsk-1',
      title: 'Initialize repository structure',
      description: 'Setup initial architecture and test harness',
      status: 'COMPLETED',
      priority: 'HIGH',
      assignedTo: 'usr-1',
      tags: ['setup', 'infra'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tasks.set(defaultTask.id, defaultTask);
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  public getAllTasks(filter?: TaskFilterOptions): Task[] {
    let result = Array.from(this.tasks.values());

    if (filter) {
      if (filter.status) {
        result = result.filter(t => t.status === filter.status);
      }
      if (filter.priority) {
        result = result.filter(t => t.priority === filter.priority);
      }
      if (filter.assignedTo) {
        result = result.filter(t => t.assignedTo === filter.assignedTo);
      }
      if (filter.search) {
        const sanitizedQuery = escapeRegex(filter.search.trim()).toLowerCase();
        result = result.filter(
          t => t.title.toLowerCase().includes(sanitizedQuery) || t.description.toLowerCase().includes(sanitizedQuery)
        );
      }
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public insertTask(task: Task): Task {
    this.tasks.set(task.id, task);
    return task;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;

    const updated: Task = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date()
    };
    this.tasks.set(id, updated);
    return updated;
  }

  public deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public reset(): void {
    this.tasks.clear();
    this.users.clear();
    this.seedDefaultData();
  }
}

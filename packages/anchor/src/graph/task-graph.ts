/**
 * TaskGraph - State-pinned DAG for task management
 *
 * Manages task dependencies, status tracking, and snapshot binding.
 * Persists graph state to grimoires/anchor/sessions/{sessionId}/graph.json
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { z } from 'zod';
import type { Task, TaskType, TaskStatus, TaskGraphData } from '../types.js';

/** Zod schema for task validation */
const TaskSchema = z.object({
  id: z.string(),
  type: z.enum(['fork', 'ground', 'warden', 'generate', 'validate', 'write']),
  status: z.enum(['pending', 'running', 'complete', 'blocked', 'failed']),
  snapshotId: z.string().optional(),
  checkpointId: z.string().optional(),
  dependencies: z.array(z.string()),
  input: z.unknown(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  createdAt: z.string().transform((s: string) => new Date(s)),
  completedAt: z
    .string()
    .transform((s: string) => new Date(s))
    .optional(),
});

const TaskGraphDataSchema = z.object({
  sessionId: z.string(),
  tasks: z.array(TaskSchema),
  headTaskId: z.string().optional(),
  lastUpdated: z.string().transform((s: string) => new Date(s)),
});

/** Task graph configuration */
export interface TaskGraphConfig {
  /** Session ID */
  sessionId: string;
  /** Base path for session data */
  basePath?: string;
  /** Auto-save on changes */
  autoSave?: boolean;
}

/** Default base path */
const DEFAULT_BASE_PATH = 'grimoires/anchor/sessions';

/** Task ID counter for generating unique IDs */
let taskCounter = 0;

/**
 * Generate a unique task ID
 */
export function generateTaskId(type: TaskType): string {
  return `${type}-${Date.now().toString(36)}-${(++taskCounter).toString(36)}`;
}

/**
 * Reset the task counter (for testing)
 */
export function resetTaskCounter(): void {
  taskCounter = 0;
}

/**
 * TaskGraph class for managing state-pinned task DAG
 */
export class TaskGraph {
  private tasks: Map<string, Task> = new Map();
  private dependents: Map<string, Set<string>> = new Map();
  private sessionId: string;
  private basePath: string;
  private autoSave: boolean;
  private headTaskId: string | undefined;

  constructor(config: TaskGraphConfig) {
    this.sessionId = config.sessionId;
    this.basePath = config.basePath ?? DEFAULT_BASE_PATH;
    this.autoSave = config.autoSave ?? true;
  }

  /**
   * Initialize the graph by loading persisted state
   */
  async init(): Promise<void> {
    await this.load();
  }

  /**
   * Add a task to the graph
   *
   * @param task - Task to add
   */
  async addTask(task: Task): Promise<void> {
    // Validate no circular dependencies
    this.validateNoCycle(task);

    this.tasks.set(task.id, task);

    // Track reverse dependencies
    for (const depId of task.dependencies) {
      if (!this.dependents.has(depId)) {
        this.dependents.set(depId, new Set());
      }
      this.dependents.get(depId)!.add(task.id);
    }

    this.headTaskId = task.id;

    if (this.autoSave) {
      await this.save();
    }
  }

  /**
   * Update task status
   *
   * @param taskId - Task ID
   * @param status - New status
   */
  async updateStatus(taskId: string, status: TaskStatus): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = status;
    if (status === 'complete' || status === 'failed') {
      task.completedAt = new Date();
    }

    if (this.autoSave) {
      await this.save();
    }
  }

  /**
   * Set the snapshot binding for a task
   *
   * @param taskId - Task ID
   * @param snapshotId - Snapshot ID
   */
  async setSnapshot(taskId: string, snapshotId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.snapshotId = snapshotId;

    if (this.autoSave) {
      await this.save();
    }
  }

  /**
   * Set the checkpoint binding for a task
   *
   * @param taskId - Task ID
   * @param checkpointId - Checkpoint ID
   */
  async setCheckpoint(taskId: string, checkpointId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.checkpointId = checkpointId;

    if (this.autoSave) {
      await this.save();
    }
  }

  /**
   * Set task output
   *
   * @param taskId - Task ID
   * @param output - Task output
   */
  async setOutput(taskId: string, output: unknown): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.output = output;

    if (this.autoSave) {
      await this.save();
    }
  }

  /**
   * Set task error
   *
   * @param taskId - Task ID
   * @param error - Error message
   */
  async setError(taskId: string, error: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.error = error;
    task.status = 'failed';

    if (this.autoSave) {
      await this.save();
    }
  }

  /**
   * Get a task by ID
   *
   * @param taskId - Task ID
   * @returns Task if found
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   *
   * @returns Array of all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by status
   *
   * @param status - Status to filter by
   * @returns Array of matching tasks
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter((t) => t.status === status);
  }

  /**
   * Check if a task can run (all dependencies complete)
   *
   * @param taskId - Task ID
   * @returns True if all dependencies are complete
   */
  canRun(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    if (task.status !== 'pending') return false;

    for (const depId of task.dependencies) {
      const dep = this.tasks.get(depId);
      if (!dep || dep.status !== 'complete') {
        return false;
      }
    }

    return true;
  }

  /**
   * Get the next runnable task (pending with all deps complete)
   *
   * @returns Next runnable task or undefined
   */
  getNextRunnable(): Task | undefined {
    for (const task of this.tasks.values()) {
      if (this.canRun(task.id)) {
        return task;
      }
    }
    return undefined;
  }

  /**
   * Propagate blocked status to all dependents of a failed task
   *
   * @param taskId - ID of the failed task
   */
  async propagateBlocked(taskId: string): Promise<void> {
    const dependentIds = this.dependents.get(taskId);
    if (!dependentIds) return;

    for (const depId of dependentIds) {
      const task = this.tasks.get(depId);
      if (task && task.status === 'pending') {
        task.status = 'blocked';
        await this.propagateBlocked(depId);
      }
    }

    if (this.autoSave) {
      await this.save();
    }
  }

  /**
   * Find the recovery point for a failed task
   *
   * @param taskId - ID of the task needing recovery
   * @returns Last complete task with snapshot, or undefined
   */
  findRecoveryPoint(taskId: string): Task | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    // Walk back through dependencies to find last complete with snapshot
    const visited = new Set<string>();
    const queue = [...task.dependencies];

    let bestRecovery: Task | undefined;

    while (queue.length > 0) {
      const id = queue.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);

      const dep = this.tasks.get(id);
      if (!dep) continue;

      if (dep.status === 'complete' && dep.snapshotId) {
        if (!bestRecovery || dep.createdAt > bestRecovery.createdAt) {
          bestRecovery = dep;
        }
      }

      queue.push(...dep.dependencies);
    }

    return bestRecovery;
  }

  /**
   * Check if there are any blocked tasks
   *
   * @returns True if any tasks are blocked
   */
  hasBlocked(): boolean {
    for (const task of this.tasks.values()) {
      if (task.status === 'blocked') {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if all tasks are complete
   *
   * @returns True if all tasks are complete
   */
  isComplete(): boolean {
    for (const task of this.tasks.values()) {
      if (task.status !== 'complete') {
        return false;
      }
    }
    return this.tasks.size > 0;
  }

  /**
   * Get the graph file path
   */
  private getGraphPath(): string {
    return join(this.basePath, this.sessionId, 'graph.json');
  }

  /**
   * Export graph data as JSON-serializable object
   *
   * @returns Task graph data
   */
  toJSON(): TaskGraphData {
    return {
      sessionId: this.sessionId,
      tasks: Array.from(this.tasks.values()),
      lastUpdated: new Date(),
      ...(this.headTaskId !== undefined && { headTaskId: this.headTaskId }),
    };
  }

  /**
   * Save the graph to disk
   */
  async save(): Promise<void> {
    const data = this.toJSON();

    const path = this.getGraphPath();
    const dir = dirname(path);

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(path, JSON.stringify(data, null, 2));
  }

  /**
   * Load the graph from disk
   */
  async load(): Promise<void> {
    const path = this.getGraphPath();

    if (!existsSync(path)) {
      return;
    }

    try {
      const content = await readFile(path, 'utf-8');
      const raw = JSON.parse(content);
      const data = TaskGraphDataSchema.parse(raw);

      this.tasks.clear();
      this.dependents.clear();

      for (const task of data.tasks) {
        this.tasks.set(task.id, task as Task);

        for (const depId of task.dependencies) {
          if (!this.dependents.has(depId)) {
            this.dependents.set(depId, new Set());
          }
          this.dependents.get(depId)!.add(task.id);
        }
      }

      this.headTaskId = data.headTaskId;
    } catch {
      // Corrupt file, start fresh
    }
  }

  /**
   * Validate that adding a task doesn't create a cycle
   */
  private validateNoCycle(newTask: Task): void {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const hasCycle = (taskId: string): boolean => {
      if (stack.has(taskId)) return true;
      if (visited.has(taskId)) return false;

      visited.add(taskId);
      stack.add(taskId);

      const task = taskId === newTask.id ? newTask : this.tasks.get(taskId);
      if (task) {
        for (const depId of task.dependencies) {
          if (hasCycle(depId)) return true;
        }
      }

      stack.delete(taskId);
      return false;
    };

    if (hasCycle(newTask.id)) {
      throw new Error(`Adding task ${newTask.id} would create a circular dependency`);
    }
  }
}

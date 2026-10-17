import { Task, AgentEvent, AgentEventType } from "@/lib/types/task";
import { SAMPLE_PROJECTS } from "@/lib/sample-projects";
import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "workspaces-data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

class TaskStore {
  private tasks: Map<string, Task> = new Map();
  private initialized: boolean = false;

  private async ensureInitialized() {
    if (this.initialized) return;

    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const content = await fs.readFile(TASKS_FILE, "utf-8");
      const list: Task[] = JSON.parse(content);
      for (const t of list) {
        this.tasks.set(t.id, t);
      }
    } catch {
      // If file doesn't exist, bootstrap with initial demo tasks
      await this.resetDemoData();
    }

    this.initialized = true;
  }

  private async persist() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const list = Array.from(this.tasks.values());
      await fs.writeFile(TASKS_FILE, JSON.stringify(list, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed persisting tasks to disk:", err);
    }
  }

  public async resetDemoData(): Promise<Task[]> {
    this.tasks.clear();

    // Create a demo task for each sample project
    for (const project of SAMPLE_PROJECTS) {
      const taskId = `task_${project.id}`;
      const now = Date.now();
      const task: Task = {
        id: taskId,
        title: project.defaultTaskTitle,
        taskDescription: project.defaultTaskDescription,
        projectId: project.id,
        projectName: project.name,
        status: "idle",
        requireApprovalForChanges: true,
        maxRepairAttempts: 3,
        currentRepairAttempt: 0,
        files: project.files,
        plan: [],
        proposedChanges: [],
        appliedChanges: [],
        testRuns: [],
        repairHistory: [],
        events: [
          {
            id: `ev_init_${now}`,
            timestamp: now,
            type: "task_created",
            message: `Sample project '${project.name}' loaded with ${project.files.length} files.`,
            metadata: { projectId: project.id }
          }
        ],
        modelId: "nvidia/Nemotron-3_5-Lightning",
        isMockMode: false,
        createdAt: now,
        updatedAt: now
      };
      this.tasks.set(task.id, task);
    }

    this.initialized = true;
    await this.persist();
    return Array.from(this.tasks.values());
  }

  public async listTasks(): Promise<Task[]> {
    await this.ensureInitialized();
    return Array.from(this.tasks.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public async getTask(id: string): Promise<Task | null> {
    await this.ensureInitialized();
    return this.tasks.get(id) || null;
  }

  public async saveTask(task: Task): Promise<Task> {
    await this.ensureInitialized();
    task.updatedAt = Date.now();
    this.tasks.set(task.id, task);
    await this.persist();
    return task;
  }

  public async addEvent(
    taskId: string,
    type: AgentEventType,
    message: string,
    metadata?: Record<string, any>
  ): Promise<AgentEvent> {
    await this.ensureInitialized();
    const task = this.tasks.get(taskId);
    const event: AgentEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      type,
      message,
      metadata
    };

    if (task) {
      task.events.push(event);
      task.updatedAt = Date.now();
      await this.persist();
    }

    return event;
  }

  public async deleteTask(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const exists = this.tasks.delete(id);
    if (exists) {
      await this.persist();
    }
    return exists;
  }
}

export const taskStore = new TaskStore();

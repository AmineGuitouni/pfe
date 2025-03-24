export interface Task {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  task_status: TaskStatusType;
  difficultyLevel: number;
}

export interface GeneratedTask {
  title: string;
  description: string;
  dependencies: string[];
  difficultyLevel: number;
}

export type ProjectStatusType = "Not Started" | "In Progress" | "Completed" | "Cancelled";
export type TaskStatusType = "To Do" | "In Progress" | "Blocked" | "Completed";

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string | null;
  tasks_count: number;
  project_status: ProjectStatusType;
  created_at: string;
}
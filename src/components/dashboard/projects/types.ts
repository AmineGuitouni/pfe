export interface Task {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  difficultyLevel: number;
}

export interface GeneratedTask {
  title: string;
  description: string;
  dependencies: string[];
  difficultyLevel: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string | null;
  tasks_count: number;
  created_at: string;
}
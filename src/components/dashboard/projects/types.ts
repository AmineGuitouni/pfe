export interface Task {
  id: number;
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
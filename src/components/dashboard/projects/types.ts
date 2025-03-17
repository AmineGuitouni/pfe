export interface Task {
  id: number;
  title: string;
  description: string;
  dependencies: string[];
  borderColor: string;
}
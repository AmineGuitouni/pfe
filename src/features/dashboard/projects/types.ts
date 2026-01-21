export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  image?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  task_status?: TaskStatusType;
  difficultyLevel: number;
  user_id? : string
  checked : boolean
  assigned_users?: User[];
}

export interface GeneratedTask {
  title: string;
  description: string;
  dependencies: string[];
  difficultyLevel: number;
}

export type ProjectStatusType = "Not Started" | "In Progress" | "Completed" | "Cancelled";
export type TaskStatusType = "To Do" | "In Progress" | "Blocked" | "All" | "Completed";

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string | null;
  tasks_count: number;
  project_status: ProjectStatusType;
  created_at: string;
}

export type AssignmentData = {
  assignments: Assignment[];
  unassignedUsers: UnassignedUser[];
};

export type Assignment = {
  taskId: string;
  taskTitle: string;
  assignedUsers: AssignedUser;
};

export type AssignedUser = {
  userId: string;
  userEmail: string;
  confidenceScore: number;
  matchingSkills: string[];
  matchingExperience: string[];
  potentialConcerns: string[];
};

export type UnassignedUser = {
  userId: string;
  reason: string;
};
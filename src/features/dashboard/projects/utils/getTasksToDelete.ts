import { GeneratedTask } from "../types";

export function getTasksToDelete(taskIndex: number, prevTasks: GeneratedTask[]) {
    if (taskIndex < 0 || taskIndex >= prevTasks.length) return [];
  
      const taskToDelete = prevTasks[taskIndex];
      const tasksToDelete = new Set<string>([taskToDelete.title]);
  
      let hasChanged;
      do {
        hasChanged = false;
        prevTasks.forEach(task => {
          if (tasksToDelete.has(task.title)) return; // Already marked for deletion
          if (task.dependencies.some(dep => tasksToDelete.has(dep))) {
            tasksToDelete.add(task.title);
            hasChanged = true;
          }
        });
      } while (hasChanged);

      return Array.from(tasksToDelete);
}
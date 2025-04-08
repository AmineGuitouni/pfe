import { GeneratedTask, Task } from "../types";

export function sortTasks(tasks: GeneratedTask[]): GeneratedTask[] {
  const titleToTask = new Map<string, GeneratedTask>();
  tasks.forEach(task => titleToTask.set(task.title, task));

  const dependents = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize in-degree and dependents maps
  for (const task of tasks) {
    inDegree.set(task.title, task.dependencies.length);
    for (const dep of task.dependencies) {
      if (!dependents.has(dep)) {
        dependents.set(dep, []);
      }
      dependents.get(dep)!.push(task.title);
    }
  }

  // Initialize queue with tasks having no dependencies, sorted by difficulty descending
  const queue: string[] = [];
  for (const task of tasks) {
    if (inDegree.get(task.title) === 0) {
      queue.push(task.title);
    }
  }
  queue.sort((a, b) => titleToTask.get(b)!.difficultyLevel - titleToTask.get(a)!.difficultyLevel);

  const sortedTitles: string[] = [];

  while (queue.length > 0) {
    const currentTitle = queue.shift()!;
    sortedTitles.push(currentTitle);

    // Process dependents and update their in-degree
    const currentDependents = dependents.get(currentTitle) || [];
    for (const dependentTitle of currentDependents) {
      const degree = inDegree.get(dependentTitle)! - 1;
      inDegree.set(dependentTitle, degree);

      // Add to queue when all dependencies are resolved
      if (degree === 0) {
        queue.push(dependentTitle);
      }
    }

    // Maintain priority queue order by difficulty descending
    queue.sort((a, b) => titleToTask.get(b)!.difficultyLevel - titleToTask.get(a)!.difficultyLevel);
  }

  // Check for circular dependencies
  if (sortedTitles.length !== tasks.length) {
    throw new Error("Circular dependency detected");
  }

  // Convert sorted titles back to Task objects
  return sortedTitles.map(title => titleToTask.get(title)!);
}


export function sortTasksById(tasks: Task[]): Task[] {
  const IdToTask = new Map<string, Task>();
  tasks.forEach(task => IdToTask.set(task.id, task));

  const dependents = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize in-degree and dependents maps
  for (const task of tasks) {
    inDegree.set(task.id, task.dependencies.length);
    for (const dep of task.dependencies) {
      if (!dependents.has(dep)) {
        dependents.set(dep, []);
      }
      dependents.get(dep)!.push(task.id);
    }
  }

  // Initialize queue with tasks having no dependencies, sorted by difficulty descending
  const queue: string[] = [];
  for (const task of tasks) {
    if (inDegree.get(task.id) === 0) {
      queue.push(task.id);
    }
  }
  queue.sort((a, b) => IdToTask.get(b)!.difficultyLevel - IdToTask.get(a)!.difficultyLevel);

  const sortedIds: string[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    sortedIds.push(currentId);

    // Process dependents and update their in-degree
    const currentDependents = dependents.get(currentId) || [];
    for (const dependentId of currentDependents) {
      const degree = inDegree.get(dependentId)! - 1;
      inDegree.set(dependentId, degree);

      // Add to queue when all dependencies are resolved
      if (degree === 0) {
        queue.push(dependentId);
      }
    }

    // Maintain priority queue order by difficulty descending
    queue.sort((a, b) => IdToTask.get(b)!.difficultyLevel - IdToTask.get(a)!.difficultyLevel);
  }

  // Check for circular dependencies
  if (sortedIds.length !== tasks.length) {
    throw new Error("Circular dependency detected");
  }

  // Convert sorted titles back to Task objects
  return sortedIds.map(title => IdToTask.get(title)!);
}
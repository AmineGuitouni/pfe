import { MarkerType } from '@xyflow/react';
import { GeneratedTask } from '../../../types';
import { TaskFlowNode, TaskFlowEdge, LayoutConfig, FlowPosition } from './types';

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 280,
  nodeHeight: 140,
  horizontalSpacing: 150,
  verticalSpacing: 120,
};

// Advanced hierarchical layout with better spacing and organization
export function calculateHierarchicalLayout(
  tasks: GeneratedTask[],
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): Map<string, FlowPosition> {
  const positions = new Map<string, FlowPosition>();
  const levels = new Map<string, number>();
  const recursionStack = new Set<string>();
  
  // Calculate dependency levels for each task with cycle detection
  function calculateLevel(taskTitle: string, currentTasks: GeneratedTask[]): number {
    if (recursionStack.has(taskTitle)) {
      // Circular dependency detected, assign to level 0
      levels.set(taskTitle, 0);
      return 0;
    }
    
    if (levels.has(taskTitle)) {
      return levels.get(taskTitle)!;
    }
    
    const task = currentTasks.find(t => t.title === taskTitle);
    if (!task || task.dependencies.length === 0) {
      levels.set(taskTitle, 0);
      return 0;
    }
    
    recursionStack.add(taskTitle);
    
    let maxDependencyLevel = -1;
    for (const dependency of task.dependencies) {
      const dependencyLevel = calculateLevel(dependency, currentTasks);
      maxDependencyLevel = Math.max(maxDependencyLevel, dependencyLevel);
    }
    
    const level = maxDependencyLevel + 1;
    levels.set(taskTitle, level);
    recursionStack.delete(taskTitle);
    
    return level;
  }
  
  // Calculate levels for all tasks
  tasks.forEach(task => {
    if (!levels.has(task.title)) {
      calculateLevel(task.title, tasks);
    }
  });
  
  // Group tasks by level and sort by difficulty for better visual hierarchy
  const levelGroups = new Map<number, GeneratedTask[]>();
  tasks.forEach(task => {
    const level = levels.get(task.title) || 0;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(task);
  });
  
  // Sort tasks within each level by difficulty (easier tasks first) and dependency count
  levelGroups.forEach((tasksInLevel) => {
    tasksInLevel.sort((a, b) => {
      // Primary sort: difficulty level (easier first)
      if (a.difficultyLevel !== b.difficultyLevel) {
        return a.difficultyLevel - b.difficultyLevel;
      }
      // Secondary sort: fewer dependencies first
      return a.dependencies.length - b.dependencies.length;
    });
  });
  
  levelGroups.forEach((tasksInLevel, level) => {
    const tasksCount = tasksInLevel.length;
    
    // Dynamic spacing based on number of tasks in level
    const levelWidth = Math.max(
      tasksCount * config.nodeWidth + (tasksCount - 1) * config.horizontalSpacing,
      config.nodeWidth
    );
    
    // Center the level horizontally
    const startX = -levelWidth / 2;
    
    // Vertical position with better spacing for readability
    const y = level * (config.nodeHeight + config.verticalSpacing);
    
    tasksInLevel.forEach((task, index) => {
      let x: number;
      
      if (tasksCount === 1) {
        // Center single task
        x = 0;
      } else {
        // Distribute tasks evenly across the level
        const spacing = levelWidth / (tasksCount - 1);
        x = startX + (index * spacing);
      }
      
      positions.set(task.title, { x, y });
    });
  });
  
  return positions;
}

// Alternative force-directed layout for complex dependency structures
export function calculateForceDirectedLayout(
  tasks: GeneratedTask[],
): Map<string, FlowPosition> {
  const positions = new Map<string, FlowPosition>();
  const forces = new Map<string, { x: number; y: number }>();
  
  // Initialize random positions
  tasks.forEach((task, index) => {
    const angle = (index / tasks.length) * 2 * Math.PI;
    const radius = Math.min(tasks.length * 30, 300);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    positions.set(task.title, { x, y });
    forces.set(task.title, { x: 0, y: 0 });
  });
  
  // Run force simulation
  const iterations = 100;
  const repulsionStrength = 5000;
  const attractionStrength = 0.1;
  const damping = 0.9;
  
  for (let iter = 0; iter < iterations; iter++) {
    // Reset forces
    forces.forEach((force) => {
      force.x = 0;
      force.y = 0;
    });
    
    // Calculate repulsion forces between all nodes
    tasks.forEach((taskA) => {
      tasks.forEach((taskB) => {
        if (taskA.title !== taskB.title) {
          const posA = positions.get(taskA.title)!;
          const posB = positions.get(taskB.title)!;
          const dx = posA.x - posB.x;
          const dy = posA.y - posB.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsionStrength / (distance * distance);
          
          const forceA = forces.get(taskA.title)!;
          forceA.x += (dx / distance) * force;
          forceA.y += (dy / distance) * force;
        }
      });
    });
    
    // Calculate attraction forces for dependencies
    tasks.forEach((task) => {
      task.dependencies.forEach((depTitle) => {
        const taskPos = positions.get(task.title);
        const depPos = positions.get(depTitle);
        
        if (taskPos && depPos) {
          const dx = depPos.x - taskPos.x;
          const dy = depPos.y - taskPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = distance * attractionStrength;
          
          const taskForce = forces.get(task.title)!;
          taskForce.x += dx * force;
          taskForce.y += dy * force;
          
          const depForce = forces.get(depTitle)!;
          depForce.x -= dx * force;
          depForce.y -= dy * force;
        }
      });
    });
    
    // Apply forces and update positions
    tasks.forEach((task) => {
      const pos = positions.get(task.title)!;
      const force = forces.get(task.title)!;
      
      pos.x += force.x * damping;
      pos.y += force.y * damping;
    });
  }
  
  return positions;
}

// Improved layered layout for complex hierarchies
export function calculateLayeredLayout(
  tasks: GeneratedTask[],
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): Map<string, FlowPosition> {
  const positions = new Map<string, FlowPosition>();
  
  // Build dependency graph
  const dependents = new Map<string, string[]>();
  const dependencies = new Map<string, string[]>();
  
  tasks.forEach(task => {
    dependencies.set(task.title, [...task.dependencies]);
    dependents.set(task.title, []);
  });
  
  tasks.forEach(task => {
    task.dependencies.forEach(dep => {
      const depList = dependents.get(dep) || [];
      depList.push(task.title);
      dependents.set(dep, depList);
    });
  });
  
  // Topological sort with Kahn's algorithm
  const layers: string[][] = [];
  const inDegree = new Map<string, number>();
  
  tasks.forEach(task => {
    inDegree.set(task.title, task.dependencies.length);
  });
  
  while (inDegree.size > 0) {
    // Find nodes with no incoming edges
    const zeroInDegree = Array.from(inDegree.entries())
      .filter(([_, degree]) => degree === 0)
      .map(([title, _]) => title);
    
    if (zeroInDegree.length === 0) {
      // Circular dependency - add remaining nodes to final layer
      layers.push(Array.from(inDegree.keys()));
      break;
    }
    
    layers.push([...zeroInDegree]);
    
    // Remove processed nodes and update in-degrees
    zeroInDegree.forEach(title => {
      inDegree.delete(title);
      const deps = dependents.get(title) || [];
      deps.forEach(dep => {
        const currentDegree = inDegree.get(dep);
        if (currentDegree !== undefined) {
          inDegree.set(dep, currentDegree - 1);
        }
      });
    });
  }
  
  // Position nodes in layers
  layers.forEach((layer, layerIndex) => {
    const y = layerIndex * (config.nodeHeight + config.verticalSpacing);
    const layerTasks = layer.map(title => tasks.find(t => t.title === title)!).filter(Boolean);
    
    // Sort by difficulty within layer
    layerTasks.sort((a, b) => a.difficultyLevel - b.difficultyLevel);
    
    const totalWidth = layerTasks.length * config.nodeWidth +
                      (layerTasks.length - 1) * config.horizontalSpacing;
    const startX = -totalWidth / 2;
    
    layerTasks.forEach((task, index) => {
      const x = startX + index * (config.nodeWidth + config.horizontalSpacing);
      positions.set(task.title, { x, y });
    });
  });
  
  return positions;
}

// Convert tasks to React Flow nodes with improved layout
export function createFlowNodes(
  tasks: GeneratedTask[],
  onEdit: (task: GeneratedTask) => void,
  onDelete: (index: number) => void,
  onDependencyClick: (dependency: string) => void,
  highlightedTaskIndex: number | null,
  layoutAlgorithm: 'hierarchical' | 'layered' | 'force-directed' = 'layered'
): TaskFlowNode[] {
  let positions: Map<string, FlowPosition>;
  
  switch (layoutAlgorithm) {
    case 'force-directed':
      positions = calculateForceDirectedLayout(tasks);
      break;
    case 'hierarchical':
      positions = calculateHierarchicalLayout(tasks);
      break;
    case 'layered':
    default:
      positions = calculateLayeredLayout(tasks);
      break;
  }
  
  return tasks.map((task, index) => {
    const position = positions.get(task.title) || { x: 0, y: 0 };
    
    return {
      id: `task-${index}`,
      type: 'taskNode',
      position,
      data: {
        task,
        index,
        onEdit,
        onDelete,
        onDependencyClick,
        isHighlighted: highlightedTaskIndex === index,
        allTasks: tasks,
      },
    };
  });
}

// Convert task dependencies to React Flow edges with improved styling
export function createFlowEdges(tasks: GeneratedTask[]): TaskFlowEdge[] {
  const edges: TaskFlowEdge[] = [];
  
  tasks.forEach((task, taskIndex) => {
    task.dependencies.forEach((dependency, depIndex) => {
      const dependencyIndex = tasks.findIndex(t => t.title === dependency);
      
      if (dependencyIndex !== -1) {
        const sourceTask = tasks[dependencyIndex];
        const targetTask = task;
        
        // Color edge based on difficulty difference
        const difficultyDiff = Math.abs(sourceTask.difficultyLevel - targetTask.difficultyLevel);
        const edgeColor = difficultyDiff > 2 ? '#f87171' : // Red for high difficulty jumps
                         difficultyDiff > 1 ? '#facc15' : // Yellow for medium jumps
                         '#8ab0e0'; // Default blue for small/no jumps
        
        // Edge thickness based on number of dependencies
        const strokeWidth = Math.max(1, Math.min(4, 6 - task.dependencies.length));
        
        edges.push({
          id: `edge-${dependencyIndex}-${taskIndex}-${depIndex}`,
          source: `task-${dependencyIndex}`,
          target: `task-${taskIndex}`,
          type: 'smoothstep',
          animated: difficultyDiff > 1, // Animate complex dependencies
          style: {
            stroke: edgeColor,
            strokeWidth,
            strokeDasharray: difficultyDiff > 2 ? '5,5' : undefined, // Dashed for complex dependencies
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
            width: 12 + strokeWidth,
            height: 12 + strokeWidth,
          },
          data: {
            dependency,
            difficultyDiff,
          },
          label: difficultyDiff > 2 ? '⚠️' : undefined, // Warning icon for complex dependencies
          labelStyle: {
            fill: edgeColor,
            fontWeight: 'bold',
          },
          labelBgStyle: {
            fill: 'rgba(0,0,0,0.8)',
            fillOpacity: 0.8,
          },
        });
      }
    });
  });
  
  return edges;
}

// Detect circular dependencies
export function detectCircularDependencies(tasks: GeneratedTask[]): string[] {
  const circularPaths: string[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function dfs(taskTitle: string, path: string[]): void {
    if (recursionStack.has(taskTitle)) {
      // Found a cycle
      const cycleStart = path.indexOf(taskTitle);
      const cycle = path.slice(cycleStart).concat(taskTitle);
      circularPaths.push(cycle.join(' -> '));
      return;
    }
    
    if (visited.has(taskTitle)) {
      return;
    }
    
    visited.add(taskTitle);
    recursionStack.add(taskTitle);
    
    const task = tasks.find(t => t.title === taskTitle);
    if (task) {
      task.dependencies.forEach(dependency => {
        dfs(dependency, [...path, taskTitle]);
      });
    }
    
    recursionStack.delete(taskTitle);
  }
  
  tasks.forEach(task => {
    if (!visited.has(task.title)) {
      dfs(task.title, []);
    }
  });
  
  return circularPaths;
}

// Get difficulty level color (matching existing TaskItem colors)
export function getDifficultyColor(difficultyLevel: number): string {
  const colors = ['#2dd4bf', '#60a5fa', '#facc15', '#f87171', '#a855f7'];
  return colors[difficultyLevel - 1] || colors[0];
}
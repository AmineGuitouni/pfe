import { Node, Edge } from '@xyflow/react';
import { GeneratedTask } from '../../../types';

export interface TaskFlowNode extends Node {
  data: {
    task: GeneratedTask;
    index: number;
    onEdit: (task: GeneratedTask, preventLayoutRecalculation?: boolean) => void;
    onDelete: (index: number) => void;
    onDependencyClick: (dependency: string) => void;
    isHighlighted: boolean;
    allTasks: GeneratedTask[];
  };
}

export interface TaskFlowEdge extends Edge {
  data?: {
    dependency: string;
    difficultyDiff?: number;
  };
}

export type ViewMode = 'list' | 'flow';

export interface FlowPosition {
  x: number;
  y: number;
}

export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
}

export type LayoutAlgorithm = 'hierarchical' | 'layered' | 'force-directed';

export interface LayoutOptions {
  algorithm: LayoutAlgorithm;
  config: LayoutConfig;
}
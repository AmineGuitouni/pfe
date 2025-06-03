"use client";
import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './flow.css';
import { GeneratedTask } from '../../../types';
import TaskNode from './TaskNode';
import FlowControls from './FlowControls';
import { LayoutAlgorithm } from './types';
import {
  createFlowNodes,
  createFlowEdges,
  detectCircularDependencies
} from './layoutUtils';

// Define custom node types
const nodeTypes = {
  taskNode: TaskNode,
};

interface TaskFlowViewInnerProps {
  tasks: GeneratedTask[];
  onEdit: (task: GeneratedTask) => void;
  onDelete: (index: number) => void;
  onDependencyClick: (dependency: string) => void;
  highlightedTaskIndex: number | null;
  searchText: string;
}

const TaskFlowViewInner: React.FC<TaskFlowViewInnerProps> = ({
  tasks,
  onEdit,
  onDelete,
  onDependencyClick,
  highlightedTaskIndex,
  searchText,
}) => {
  const { fitView } = useReactFlow();
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<LayoutAlgorithm>('layered');
  const [shouldRecalculateLayout, setShouldRecalculateLayout] = useState(true);
  const [previousTaskTitles, setPreviousTaskTitles] = useState(tasks.map(t => t.title));
  const [isManualDependencyChange, setIsManualDependencyChange] = useState(false);
  
  // Enhanced edit function that includes all tasks for the modal
  const handleEdit = useCallback((task: GeneratedTask, preventLayoutRecalculation = false) => {
    if (preventLayoutRecalculation) {
      // Mark this as a manual dependency change
      setIsManualDependencyChange(true);
    }
    onEdit(task);
  }, [onEdit]);

  // Create initial nodes only when layout should be recalculated
  const initialNodes = useMemo(
    () => {
      if (shouldRecalculateLayout) {
        return createFlowNodes(tasks, handleEdit, onDelete, onDependencyClick, highlightedTaskIndex, layoutAlgorithm);
      }
      return []; // Will be handled by the nodes state
    },
    [shouldRecalculateLayout, tasks, handleEdit, onDelete, onDependencyClick, highlightedTaskIndex, layoutAlgorithm]
  );
  
  const initialEdges = useMemo(
    () => createFlowEdges(tasks),
    [tasks]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Detect when new tasks are added/removed (by comparing task titles)
  React.useEffect(() => {
    const currentTaskTitles = tasks.map(t => t.title);
    const titlesChanged =
      currentTaskTitles.length !== previousTaskTitles.length ||
      !currentTaskTitles.every(title => previousTaskTitles.includes(title)) ||
      !previousTaskTitles.every(title => currentTaskTitles.includes(title));
    
    if (titlesChanged && !isManualDependencyChange) {
      setShouldRecalculateLayout(true);
      setPreviousTaskTitles(currentTaskTitles);
    } else if (isManualDependencyChange) {
      // Reset the manual dependency change flag
      setIsManualDependencyChange(false);
    }
  }, [tasks, previousTaskTitles, isManualDependencyChange]);

  // Only recalculate layout when explicitly requested or when tasks count changes
  React.useEffect(() => {
    if (shouldRecalculateLayout) {
      const newNodes = createFlowNodes(tasks, handleEdit, onDelete, onDependencyClick, highlightedTaskIndex, layoutAlgorithm);
      setNodes(newNodes);
      setShouldRecalculateLayout(false);
    }
  }, [shouldRecalculateLayout, tasks, handleEdit, onDelete, onDependencyClick, highlightedTaskIndex, layoutAlgorithm, setNodes]);

  // Update node data without changing positions when tasks change
  React.useEffect(() => {
    if (!shouldRecalculateLayout) {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          const taskIndex = parseInt(node.id.replace('task-', ''));
          const task = tasks[taskIndex];
          if (task) {
            return {
              ...node,
              data: {
                ...node.data,
                task,
                isHighlighted: highlightedTaskIndex === taskIndex,
                allTasks: tasks,
              },
            };
          }
          return node;
        })
      );
    }
  }, [tasks, highlightedTaskIndex, shouldRecalculateLayout, setNodes]);

  // Update edges when tasks change
  React.useEffect(() => {
    const newEdges = createFlowEdges(tasks);
    setEdges(newEdges);
  }, [tasks, setEdges]);

  // Filter and style nodes based on search
  const filteredNodes = useMemo(() => {
    if (!searchText.trim()) return nodes;
    
    return nodes.map(node => {
      const isVisible = node.data.task.title.toLowerCase().includes(searchText.toLowerCase());
      return {
        ...node,
        hidden: !isVisible,
        style: {
          ...node.style,
          opacity: isVisible ? 1 : 0.3,
        }
      };
    });
  }, [nodes, searchText]);

  // Handle manual edge connections to create dependencies
  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        // Extract task indices from node IDs
        const sourceIndex = parseInt(params.source.replace('task-', ''));
        const targetIndex = parseInt(params.target.replace('task-', ''));
        
        if (sourceIndex !== targetIndex && sourceIndex >= 0 && targetIndex < tasks.length) {
          const sourceTask = tasks[sourceIndex];
          const targetTask = tasks[targetIndex];
          
          // Check if dependency already exists
          if (!targetTask.dependencies.includes(sourceTask.title)) {
            // Create updated target task with new dependency
            const updatedTargetTask = {
              ...targetTask,
              dependencies: [...targetTask.dependencies, sourceTask.title]
            };
            
            // Update the task through the edit callback without triggering layout recalculation
            handleEdit(updatedTargetTask, true);
          }
        }
      }
      
      // Don't add the edge directly - it will be recreated when tasks update
    },
    [tasks, handleEdit]
  );

  // Handle edge removal to delete dependencies
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => {
        // Extract task indices from edge source/target
        const sourceIndex = parseInt(edge.source.replace('task-', ''));
        const targetIndex = parseInt(edge.target.replace('task-', ''));
        
        if (sourceIndex >= 0 && targetIndex < tasks.length) {
          const sourceTask = tasks[sourceIndex];
          const targetTask = tasks[targetIndex];
          
          // Remove the dependency
          const updatedTargetTask = {
            ...targetTask,
            dependencies: targetTask.dependencies.filter(dep => dep !== sourceTask.title)
          };
          
          // Update the task through the edit callback without triggering layout recalculation
          handleEdit(updatedTargetTask, true);
        }
      });
    },
    [tasks, handleEdit]
  );

  // Detect circular dependencies
  const circularDependencies = useMemo(
    () => detectCircularDependencies(tasks),
    [tasks]
  );

  // Handle fit view
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2 });
  }, [fitView]);

  // Handle manual layout recalculation
  const handleRecalculateLayout = useCallback(() => {
    setShouldRecalculateLayout(true);
    setTimeout(() => handleFitView(), 100);
  }, [handleFitView]);

  // Handle layout algorithm change
  const handleLayoutChange = useCallback((algorithm: LayoutAlgorithm) => {
    setLayoutAlgorithm(algorithm);
    setShouldRecalculateLayout(true);
  }, []);

  // Fit view when component mounts or when highlighted task changes
  React.useEffect(() => {
    setTimeout(() => handleFitView(), 100);
  }, [handleFitView]);

  // Focus on highlighted node in flow view
  React.useEffect(() => {
    if (highlightedTaskIndex !== null && filteredNodes.length > 0) {
      const highlightedNode = filteredNodes.find(node => node.data.index === highlightedTaskIndex);
      if (highlightedNode) {
        // Center the view on the highlighted node
        setTimeout(() => {
          fitView({
            nodes: [highlightedNode],
            padding: 0.3,
            duration: 800
          });
        }, 100);
      }
    }
  }, [highlightedTaskIndex, filteredNodes, fitView]);

  return (
    <div className="w-full h-[600px] bg-dark_blue/20 rounded-lg border border-white/20 relative">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-dark_blue/10"
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#8ab0e0', strokeWidth: 2 },
        }}
      >
        <Background
          color="#ffffff"
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots}
          className="opacity-10"
        />
        
        <MiniMap
          className="bg-white/10 border border-white/20"
          nodeColor={(node: any) => {
            const difficultyLevel = node.data?.task?.difficultyLevel || 1;
            const colors = ['#2dd4bf', '#60a5fa', '#facc15', '#f87171', '#a855f7'];
            return colors[difficultyLevel - 1] || colors[0];
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
          pannable
          zoomable
        />
        
        <Controls
          className="bg-white/10 border border-white/20"
          showInteractive={false}
        />
      </ReactFlow>

      <FlowControls
        onFitView={handleFitView}
        onRecalculateLayout={handleRecalculateLayout}
        circularDependencies={circularDependencies}
        layoutAlgorithm={layoutAlgorithm}
        onLayoutChange={handleLayoutChange}
      />
    </div>
  );
};

interface TaskFlowViewProps {
  tasks: GeneratedTask[];
  onEdit: (task: GeneratedTask) => void;
  onDelete: (index: number) => void;
  onDependencyClick: (dependency: string) => void;
  highlightedTaskIndex: number | null;
  searchText: string;
}

const TaskFlowView: React.FC<TaskFlowViewProps> = (props) => {
  return (
    <ReactFlowProvider>
      <TaskFlowViewInner {...props} />
    </ReactFlowProvider>
  );
};

export default TaskFlowView;
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { AiOutlineLink } from 'react-icons/ai';
import { Chip, useDisclosure } from '@heroui/react';
import { getDifficultyColor } from './layoutUtils';
import { GeneratedTask } from '../../../types';
import EditTaskModal from '../../modals/editTaskModal';

interface TaskNodeProps {
  data: {
    task: GeneratedTask;
    index: number;
    onEdit: (task: GeneratedTask, preventLayoutRecalculation?: boolean) => void;
    onDelete: (index: number) => void;
    onDependencyClick: (dependency: string) => void;
    isHighlighted: boolean;
    allTasks?: GeneratedTask[];
  };
}

const TaskNode: React.FC<TaskNodeProps> = ({ data }) => {
  const { task, index, onEdit, onDelete, onDependencyClick, isHighlighted, allTasks = [] } = data;
  const borderColor = getDifficultyColor(task.difficultyLevel);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
    <div
      className={`relative bg-white/5 border-2 border-white/20 rounded-lg p-4 min-w-[250px] max-w-[300px] transition-all duration-300 shadow-lg ${
        isHighlighted
          ? 'ring-2 ring-light_blue shadow-xl scale-105 bg-white/10'
          : 'hover:bg-white/10 hover:shadow-xl hover:scale-102'
      }`}
      style={{
        borderLeftColor: borderColor,
        borderLeftWidth: '4px',
        boxShadow: isHighlighted
          ? `0 0 20px ${borderColor}40, 0 8px 32px rgba(0,0,0,0.3)`
          : '0 4px 16px rgba(0,0,0,0.2)'
      }}
    >
      {/* Input handle for dependencies */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-light_blue-500"
        style={{ left: -6 }}
      />
      
      {/* Output handle for tasks that depend on this one */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-light_blue-500"
        style={{ right: -6 }}
      />

      {/* Header with title and actions */}
      <div className="flex items-start justify-between mb-2">
        <h3
          className="text-lg font-semibold leading-tight flex-1 mr-2"
          style={{ color: borderColor }}
        >
          {task.title}
        </h3>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onOpen}
            className="p-1 rounded text-gray-400 hover:text-light_blue transition-colors"
            title="Edit task"
          >
            <FiEdit size={14} />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
            title="Delete task"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      {/* Difficulty Level Indicator */}
      <div className="flex items-center mb-2">
        <div
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: borderColor }}
        />
        <span className="text-xs text-gray-400">
          Level {task.difficultyLevel}
        </span>
      </div>

      {/* Dependencies */}
      <div className="flex items-start gap-2">
        <AiOutlineLink size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
        <div className="flex flex-col gap-1 min-h-[20px]">
          {task.dependencies.length === 0 ? (
            <span className="text-xs text-gray-400">Independent</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {task.dependencies.map((dependency: string, depIndex: number) => (
                <Chip
                  key={depIndex}
                  size="sm"
                  variant="flat"
                  className="cursor-pointer"
                  classNames={{
                    base: "bg-dark_blue text-light_blue border border-light_blue/30 hover:border-light_blue",
                    content: "text-xs",
                  }}
                  onClick={() => onDependencyClick(dependency)}
                >
                  {dependency.length > 15 ? `${dependency.substring(0, 15)}...` : dependency}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    <EditTaskModal
      task={task}
      tasks={allTasks}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onEditTask={onEdit}
    />
    </>
  );
};

export default TaskNode;
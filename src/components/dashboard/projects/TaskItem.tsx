import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { AiOutlineLink } from 'react-icons/ai';
import { Chip } from '@heroui/react';
import { Task } from './types';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  return (
    <div
      className={`p-4 border-l-4 border-1 border-white/20 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors duration-200 border-gray-700`}
      style={{ borderLeftColor: task.borderColor }}
    >
      <div className="flex items-center justify-between">
        <h3 
          className="text-lg font-semibold"
          style={{ color: task.borderColor }}
        >{task.title}</h3>
        <div className="flex">
          {/* Edit and Delete Buttons */}
          <button className="w-4 h-4  rounded mr-1 text-gray-400 hover:text-light_blue">
            <FiEdit size={16} />
          </button>
          <button className="w-4 h-4  rounded text-gray-400 hover:text-red-500">
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
      <p className="text-gray-300 mt-2">{task.description}</p>
      <div className="flex items-center mt-2">
        {/* Dependency Icon */}
        <AiOutlineLink size={16} style={{ color: 'rgb(107 114 128)', marginRight: '0.5rem' }} />
        <span className="text-sm text-gray-400">Dependencies:</span>
        {task.dependencies.length === 0 ? (
          <span className="text-sm text-gray-400 ml-1">None (Independent task)</span>
        ) : (
          <div className="flex flex-wrap">
            {task.dependencies.map((dependency, index) => (
              <Chip
                key={index}
                size="sm"
                variant="flat"
                className="ml-1 mb-1"
                classNames={{
                  base: "bg-dark_blue text-light_blue border-light_blue",
                  content: "text-light_blue",
                }}
              >
                {dependency}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;

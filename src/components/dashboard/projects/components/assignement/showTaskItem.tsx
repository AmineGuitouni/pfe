import { AiOutlineLink } from 'react-icons/ai';
import { Chip } from '@heroui/react';
import { Task } from '../../types';

interface TaskItemProps {
  task: Task;
  isHighlighted: boolean;
}

const borderColors = ['#2dd4bf', '#60a5fa', '#facc15', '#f87171', '#a855f7'];

export default function  TaskItem({ 
  task,  
  isHighlighted,
}: TaskItemProps) {

  return (
      <div
        className={`p-4 border-l-4 border-1 border-white/20 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors duration-200 border-gray-700 ${
          isHighlighted ? 'ring-1 ring-light_blue' : ''
        }`}
        style={{ borderLeftColor: borderColors[task.difficultyLevel - 1] }}
      >
        <div className="flex items-center justify-between">
          <h3
            className="text-lg font-semibold"
            style={{ color: borderColors[task.difficultyLevel - 1] }}
          >{task.title}</h3>
        </div>
        <p className="text-gray-300 mt-2">{task.description}</p>
        <div className="flex items-center mt-2">
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
                  // onClick={() => onDependencyClick(dependency)}
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
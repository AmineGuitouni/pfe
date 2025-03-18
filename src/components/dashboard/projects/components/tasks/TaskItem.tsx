import React from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { AiOutlineLink } from 'react-icons/ai';
import { Chip, useDisclosure } from '@heroui/react';
import { GeneratedTask } from '../../types';
import { motion } from 'framer-motion';
import EditTaskModal from '../modals/editTaskModal';

interface TaskItemProps {
  task: GeneratedTask;
  index: number;
  onDependencyClick: (dependency: string) => void;
  isHighlighted: boolean;
  onDelete?: (index: number) => void;
  onEdit?: (task: GeneratedTask) => void;
}

const borderColors = ['#2dd4bf', '#60a5fa', '#facc15', '#f87171', '#a855f7'];
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const TaskItem = React.forwardRef<HTMLDivElement, TaskItemProps>(({ 
  task, 
  index, 
  onDependencyClick, 
  isHighlighted,
  onDelete,
  onEdit,
}, ref) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <>
      <motion.div
      ref={ref}
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.2, delay: 0.1 * index }}
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
          <div className="flex">
            <button onClick={onOpen} className="w-4 h-4 rounded mr-1 text-gray-400 hover:text-light_blue">
              <FiEdit size={16} />
            </button>
            <button onClick={()=>{onDelete?.(index)}} className="w-4 h-4 rounded text-gray-400 hover:text-red-500">
              <FiTrash2 size={16} />
            </button>
          </div>
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
                  onClick={() => onDependencyClick(dependency)}
                >
                  {dependency}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <EditTaskModal
        task={task}
        tasks={[]}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onEditTask={onEdit}
      />
    </>
  );
});
TaskItem.displayName = 'TaskItem';
export default TaskItem
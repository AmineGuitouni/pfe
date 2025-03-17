import React from 'react';
import TaskItem from './TaskItem';
import TaskItemSkeleton from './TaskItemSkeleton';
import { Task } from './types';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, isLoading }) => {
  return (
    <div className='flex flex-col gap-4'>
      {isLoading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <TaskItemSkeleton key={index} />
        ))
      ) : (
        tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))
      )}
    </div>
  );
};

export default TaskList;
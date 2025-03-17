"use client";
import { useMemo, useRef, useState } from 'react';
import useTasks from '../../hooks/useTasks';
import TaskItem from './TaskItem';
import TaskItemSkeleton from './TaskItemSkeleton';
import { Button, Input } from '@heroui/react';
import { SearchIcon } from 'lucide-react';

interface TaskListProps {
  companyId: string;
  projectName: string;
  projectDescription: string;
}

export default function TaskList({ companyId, projectName, projectDescription }: TaskListProps) {
  const {isLoading, tasks, deleteTask, regenerateTasks} = useTasks({companyId, projectName, projectDescription});
  const taskRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [highlightedTaskIndex, setHighlightedTaskIndex] = useState<number | null>(null);

  const [searchText, setSearchText] = useState('');

  const scrollToTask = (dependency: string) => {
    const taskIndex = tasks.findIndex(task => task.title === dependency);
    if (taskIndex !== -1 && taskRefs.current[taskIndex]) {
      taskRefs.current[taskIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedTaskIndex(taskIndex);
      // Remove highlight after 1 second
      setTimeout(() => {
        setHighlightedTaskIndex(null);
      }, 1000);
    }
  };

  const filteredTasks = useMemo(()=>{
    return tasks.filter(task => task.title.toLowerCase().includes(searchText.toLowerCase()))
  },[tasks, searchText])

  return (
    <div className='w-full'>
      <div className='w-full flex justify-between mb-4'>
        <Input
          isClearable
          placeholder="Search Tasks by title..."
          size='sm'
          value={searchText}
          onValueChange={setSearchText}
          className="w-full max-w-lg dark text-white"
          startContent={<SearchIcon className="text-default-300" />}
          variant="bordered"
        />
        <Button onPress={regenerateTasks} isLoading={isLoading} isDisabled={isLoading} color="primary" size="sm" className="bg-light_blue-500 text-black">
          Regenerate Tasks
        </Button>
      </div>
      <div className='flex flex-col gap-4'>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <TaskItemSkeleton key={index} index={index} />
          ))
        ) : (
          filteredTasks.map((task, idx) => (
            <TaskItem
              key={idx}
              task={task}
              index={idx}
              onDependencyClick={scrollToTask}
              ref={(el: HTMLDivElement | null) => {
                taskRefs.current[idx] = el;
              }}
              isHighlighted={highlightedTaskIndex === idx}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
};
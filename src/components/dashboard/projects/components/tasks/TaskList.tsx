"use client";
import { useCallback, useMemo, useRef, useState } from 'react';
import useTasks from '../../hooks/useTasks';
import TaskItem from './TaskItem';
import TaskItemSkeleton from './TaskItemSkeleton';
import { Button, Input, useDisclosure } from '@heroui/react';
import { SearchIcon } from 'lucide-react';
import { getTasksToDelete } from '../../utils/getTasksToDelete';
import TaskDeleteConfirmation from '../modals/TaskDeleteConfirmationModal';
import AddTaskModal from '../modals/addTaskModal';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface TaskListProps {
  companyId: string;
  projectName: string;
  projectDescription: string;
}

export default function TaskList({ companyId, projectName, projectDescription }: TaskListProps) {
  const {isLoading, tasks, deleteTask, regenerateTasks, editTask, addTask} = useTasks({companyId, projectName, projectDescription});
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

  const [taskToDelete, setTaskToDelete] = useState<string[]>([]);
  const {isOpen: isOpenDelete, onOpen: onOpenDelete, onOpenChange: onOpenChangeDelete} = useDisclosure()
  const handleDeleteTask = async (index: number) => {
    setTaskToDelete(getTasksToDelete(index, tasks));
    onOpenDelete();
  }

  const handleConfirmDelete = () => {
    deleteTask(taskToDelete);
  }

  const {data:session} = useSession();
  const router = useRouter();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const handleCreateProject = useCallback(async () => {
    if(!session?.user.id) return
    
    try {
      setIsCreatingProject(true);
      const response = await fetch(`/api/v1/${session.user.id}/companies/${companyId}/projects/new`,{
        method: "POST",
        body: JSON.stringify({
          project:{
            name: projectName,
            description: projectDescription,
          },
          tasks
        })
      })

      if(!response.ok) {
        toast.error("Failed to create project");
        return
      }

      toast.success("Project created successfully");
      router.push(`/dashboard/${companyId}/projects`);
    }
    catch (error) {
      console.log(error);
      toast.error("Failed to create project");
    }
    finally {
      setIsCreatingProject(false);
    }
  },[session?.user.id, companyId, projectName, projectDescription, tasks, router])

  return (
    <div className='w-full'>
      <TaskDeleteConfirmation 
        tasks={taskToDelete} 
        isOpen={isOpenDelete} 
        onOpenChange={onOpenChangeDelete} 
        onConfirmDelete={handleConfirmDelete}
      />
      <div className='w-full flex justify-between mb-4 gap-8'>
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
        <div className='flex gap-2'>
          <AddTaskModal tasks={tasks} onCreateTask={addTask} />
          <Button onPress={regenerateTasks} isLoading={isLoading} isDisabled={isLoading} color="primary" size="sm" className="bg-light_blue-500 text-black">
            Regenerate Tasks
          </Button>
          <Button onPress={handleCreateProject} isDisabled={isLoading || isCreatingProject} isLoading={isCreatingProject} color="primary" size="sm" className="bg-light_blue-500 text-black">
            Create Project
          </Button>
        </div>
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
              onDelete={handleDeleteTask}
              onEdit={(task)=>{
                editTask(task, idx)
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
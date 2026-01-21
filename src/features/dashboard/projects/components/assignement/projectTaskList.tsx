"use client";
import { useMemo, useState } from 'react';
import {  Input } from '@heroui/react';
import { SearchIcon } from 'lucide-react';
import TaskItemSkeleton from '../tasks/TaskItemSkeleton';
import { useTaskUserAssgnementContext } from '../../context/taskUserAssgnementContext';
import TaskItem from './showTaskItem';
import { Draggable, Droppable } from '@hello-pangea/dnd';

export default function ProjectTaskList() {
  const {tasks, isLoadingTasks:isLoading, unLinkedTasks, tasksDisableDrop} = useTaskUserAssgnementContext()
  const [searchText, setSearchText] = useState('');

  const filteredTasks = useMemo(()=>{
    return unLinkedTasks.map(task => ({
      ...tasks[task], 
      dependencies: tasks[task].dependencies.map(d=>tasks[d].title)
    }))
    .filter(task =>task.title.toLowerCase().includes(searchText.toLowerCase()))
  },[unLinkedTasks, searchText, tasks])

  return (
    <div className='w-full h-full flex flex-col border-white/20 border-1 rounded-md p-5 overflow-hidden'>
      <div className='w-full flex justify-between mb-6 gap-8 flex-shrink-0'>
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
      </div>
      <div className='flex flex-col gap-4 flex-1 overflow-y-auto'>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <TaskItemSkeleton key={index} index={index} />
          ))
        ) 
        : (
          <Droppable droppableId="tasks" isDropDisabled={tasksDisableDrop}>
            {(provided) => (
              <div className='flex flex-col' {...provided.droppableProps} ref={provided.innerRef}>
                {
                    filteredTasks.length === 0 ? (
                      <div className='flex flex-col gap-4 h-[calc(100vh-200px)] overflow-y-auto items-center justify-center text-white/50'>
                        <h3 className='text-lg font-semibold'>No tasks found</h3>
                      </div>
                    ) :
                    filteredTasks.map((task, idx) => (
                        <Draggable key={task.id} draggableId={task.id} index={idx} >
                            {(provided, snapshot) => (
                                <div 
                                    className='mb-4 w-[calc(100%-16px)]' 
                                    ref={provided.innerRef} 
                                    {...provided.draggableProps} 
                                    {...provided.dragHandleProps}
                                    style={{
                                        ...provided.draggableProps.style,
                                        zIndex: snapshot.isDragging ? 9999 : 'auto',
                                    }}
                                >
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        isHighlighted={false}
                                    />
                                </div>
                            )}
                        </Draggable>
                    ))
                }
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    </div>
  );
};
import { Spinner } from "@heroui/react";
import { UseColumns } from "../../context/columnsContext";
import TaskContainer from "./TaskContainer";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { toDoProject } from "../../types/type";
import AddColumnButton from "../columnsComponents/addColumnButton";
import { sortTasks } from "@/components/dashboard/projects/utils/taskSorter";
import { Task } from "@/components/dashboard/projects/types";
import { useEffect } from "react";

export default function Container({isLoading, activeProject}:{isLoading: boolean, activeProject: toDoProject | undefined}) {
    const { dragDropTask, setProjects } = UseColumns();

    // Convert tasks from Record to array for sorting
    const convertTasksToArray = (tasks: Record<string, Task>) => {
        return Object.entries(tasks).map(([id, task]) => ({
            ...task,
            id
        }));
    };

    // Convert sorted array back to Record
    const convertArrayToTasks = (taskArray: Task[]) => {
        return taskArray.reduce((acc, task) => {
            acc[task.id] = task;
            return acc;
        }, {} as Record<string, Task>);
    };

    // Apply sorting to tasks in a column
    const applySortingToColumn = (columnTasks: Record<string, Task>) => {
        if (!columnTasks || Object.keys(columnTasks).length === 0) return columnTasks;

        try {
            // Convert to array format compatible with sortTasks
            const tasksArray = convertTasksToArray(columnTasks).map(task => ({
                title: task.title,
                dependencies: task.dependencies || [],
                difficultyLevel: task.difficultyLevel || 1,
                id: task.id
            }));

            // Sort the tasks
            const sortedTasks = sortTasks(tasksArray);

            // Convert back to record format
            return convertArrayToTasks(sortedTasks.map(sortedTask => {
                // Find the original task to keep all properties
                const originalTask = columnTasks[sortedTask.id];
                return originalTask;
            }));
        } catch (error) {
            console.error("Error sorting tasks:", error);
            return columnTasks; // Return original tasks if sorting fails
        }
    };

    // Apply sorting to all columns on initial load
    useEffect(() => {
        if (!activeProject) return;

        setProjects(prevProjects => {
            if (!prevProjects) return prevProjects;

            const projectId = activeProject.projectData.id;
            if (!prevProjects[projectId]) return prevProjects;

            // Create a new project with sorted columns
            const sortedColumns = { ...activeProject.columns };
            
            // Sort tasks in each column
            Object.keys(sortedColumns).forEach(columnId => {
                sortedColumns[columnId] = {
                    ...sortedColumns[columnId],
                    tasks: applySortingToColumn(sortedColumns[columnId].tasks)
                };
            });

            return {
                ...prevProjects,
                [projectId]: {
                    ...prevProjects[projectId],
                    columns: sortedColumns
                }
            };
        });
    }, [activeProject?.projectData.id, setProjects]);

    const handleDragEnd = (result: DropResult) => {
        if(!activeProject) return;

        const { destination, source, draggableId } = result;

        // If no destination, dropped in same place, or no active project, do nothing
        if (!destination || 
            (destination.droppableId === source.droppableId && 
             destination.index === source.index) ||
            !activeProject) {
            return;
        }

        const sourceColumn = activeProject.columns[source.droppableId];
        const destColumn = activeProject.columns[destination.droppableId];
        
        if (!sourceColumn.tasks || Object.keys(sourceColumn.tasks).length === 0) {
            return;
        }

        // Handle movement between different columns - status change
        if (source.droppableId !== destination.droppableId) {
            // Call dragDropTask to update state and call API
            dragDropTask(
                draggableId, 
                destColumn.tasksStatus, 
                source.droppableId, 
                destination.droppableId,
                activeProject.projectData.id
            );

            // After the drag operation, sort the tasks in the destination column
            setTimeout(() => {
                setProjects(prevProjects => {
                    if (!prevProjects || !activeProject) return prevProjects;
                    
                    const projectId = activeProject.projectData.id;
                    const project = prevProjects[projectId];
                    
                    if (!project) return prevProjects;
                    
                    const updatedColumn = {
                        ...project.columns[destination.droppableId],
                        tasks: applySortingToColumn(project.columns[destination.droppableId].tasks)
                    };
                    
                    return {
                        ...prevProjects,
                        [projectId]: {
                            ...project,
                            columns: {
                                ...project.columns,
                                [destination.droppableId]: updatedColumn
                            }
                        }
                    };
                });
            }, 100); // Small delay to ensure dragDropTask has completed

            return;
        }
        
        // For same column reordering, we'll need to implement it separately
        // but we can still apply sorting
        setProjects(prevProjects => {
            if (!prevProjects || !activeProject) return prevProjects;
            
            const projectId = activeProject.projectData.id;
            const project = prevProjects[projectId];
            
            if (!project) return prevProjects;
            
            const sortedTasks = applySortingToColumn(project.columns[source.droppableId].tasks);
            
            const updatedColumn = {
                ...project.columns[source.droppableId],
                tasks: sortedTasks
            };
            
            return {
                ...prevProjects,
                [projectId]: {
                    ...project,
                    columns: {
                        ...project.columns,
                        [source.droppableId]: updatedColumn
                    }
                }
            };
        });
    };

    if (!activeProject) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-white/40">Select a project to view tasks</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-5">
            {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                    <Spinner size="lg" color="white" className="mb-10"/>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="w-full h-full flex ">
                        {Object.entries(activeProject.columns).map(([key, column], index) => (
                            <div key={key} className="flex">
                                <TaskContainer column={column} project_id={activeProject.projectData.id} />
                                {index !== Object.keys(activeProject.columns).length - 1 && <AddColumnButton/>}
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            )}
        </div>  
    )
}

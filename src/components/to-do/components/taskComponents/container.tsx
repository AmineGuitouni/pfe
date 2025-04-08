import { Spinner } from "@heroui/react";
import { UseColumns } from "../../context/columnsContext";
import TaskContainer from "./TaskContainer";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { toDoProject } from "../../types/type";
import AddColumnButton from "../columnsComponents/addColumnButton";

export default function Container({isLoading, activeProject}:{isLoading: boolean, activeProject: toDoProject | undefined}) {
    const { dragDropTask, setProjects } = UseColumns();

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
                activeProject.projectData.id,
                source.index,
                destination.index
            );

            // After the drag operation, sort the tasks in the destination column
            setTimeout(() => {
                setProjects(prevProjects => {
                    if (!prevProjects || !activeProject) return prevProjects;
                    
                    const projectId = activeProject.projectData.id;
                    const project = prevProjects[projectId];
                    
                    if (!project) return prevProjects;
                    
                    const updatedColumn = project.columns[destination.droppableId];
                    
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
            
            const updatedColumn = project.columns[source.droppableId]
            
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

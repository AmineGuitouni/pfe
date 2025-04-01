import { Spinner } from "@heroui/react";
import { UseColumns } from "../../context/columnsContext";
import TaskContainer from "./TaskContainer";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { toDoProject } from "../../types/type";

export default function Container({isLoading,activeProject}:{isLoading: boolean,activeProject: toDoProject | undefined}) {
    const { dragDropTask } = UseColumns();

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
            return;
        }
        
        // Note: Same-column reordering would need to be implemented differently
        // with Record objects. For now, this functionality is omitted since
        // it would require additional context methods.
    };

    // Show a message if no project is selected
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
                    <div className="w-full h-full flex gap-5">
                        {Object.entries(activeProject.columns).map(([key, column]) => (
                            <div key={key} className="">
                                <TaskContainer column={column} />
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            )}
        </div>  
    )
}

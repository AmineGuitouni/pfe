"use client"
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"; // Added React import
import { Column, statusForCol, TaskBoard } from "../types/type";
import { Task } from "@/components/dashboard/projects/types";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

type ColumnsContextType = {
  projects: TaskBoard | undefined;
  setProjects: React.Dispatch<React.SetStateAction<TaskBoard | undefined>>;
  isLoading: boolean;
  search: string;
  setSearch: (value: string) => void;
  updateStatus: (task_id: string, status: string, project_id: string, column_id: string) => Promise<void>;
  dragDropTask: (task_id: string, newStatus: string, source_column_id: string, destination_column_id: string, activeProjectId: string, sourceIndex: number, destinationIndex: number) => void;
  AddColumn : (name: string, projectId: string ,onClose :() => void,task_status: string) => Promise<void>;
  deleteColumn : (columnId: string, projectId: string) => Promise<void>;
  editColumn : ({columnId, newName, projectId}: {columnId: string, newName: string, projectId: string}) => Promise<void>; // Updated type signature
  checkTask : (task_id: string, project_id: string,checked : boolean) => Promise<void>;
};

const columnsContext = createContext<ColumnsContextType>({
  projects: undefined,
  setProjects: () => {},
  isLoading: true,
  search: "",
  setSearch: () => {},
  updateStatus: async () => {},
  dragDropTask: () => {},
  AddColumn: async () => {},
  deleteColumn: async () => {},
  editColumn: async () => {},
  checkTask: async () => {},

});

export function UseColumns() {
  return useContext(columnsContext);
}

function ColumnsProvider({
  children,
  companyId
}: {
  children: React.ReactNode;
  companyId: string;
}) {
  const [projects, setProjects] = useState<TaskBoard>();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearchState] = useState("");
  const { data: session } = useSession();

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
  }, []);

  const userId = useMemo(() => session?.user?.id, [session?.user?.id]);

  const fetchProjects = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/${userId}/companies/${companyId}/to-do/list/get-tasks-projects?search=${search}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data } = await response.json();

      setProjects(data);
      console.log(data);
    } catch (error) {
      toast.error("Error fetching projects");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, search, userId]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchProjects();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchProjects]);

  const AddColumn = useCallback(async (name: string, projectId: string ,onClose :() => void,task_status: string) => {

    try{

        const response = await  fetch(`/api/v1/${userId}/companies/${companyId}/to-do/new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name,project_id: projectId ,task_status}),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const newColumnId = responseData.id;

        setProjects((prevProjects: TaskBoard | undefined) => {
            if (!prevProjects) return prevProjects;

            const activeProject = prevProjects[projectId];
            if (!activeProject || !activeProject.columns) return prevProjects;

            // Create a new column with a unique ID
            const newColumn: Column = {
                id: newColumnId,
                name: name,
                tasks: [], // Initialize with an empty array
                tasksStatus : task_status as statusForCol
            };

            // Create a new columns object that preserves order:
            // 1. To Do column first
            // 2. All other columns in the middle
            // 3. Done column last
            const newColumns: Record<string, Column> = {};

            // Find the todo and done columns
            const todoColumnEntry = Object.entries(activeProject.columns)
                .find(([_, column]) => column.tasksStatus === "To Do");

            const doneColumnEntry = Object.entries(activeProject.columns)
                .find(([_, column]) => column.tasksStatus === "Completed");

            // Add todo column first if it exists
            if (todoColumnEntry) {
                const [todoId, todoColumn] = todoColumnEntry;
                newColumns[todoId] = todoColumn;
            }

            // Add all other columns except todo and done
            Object.entries(activeProject.columns).forEach(([columnId, column]) => {
                if (
                    (!todoColumnEntry || columnId !== todoColumnEntry[0]) &&
                    (!doneColumnEntry || columnId !== doneColumnEntry[0])
                ) {
                    newColumns[columnId] = column;
                }
            });

            // Add the new column
            newColumns[newColumnId] = newColumn;

            // Add done column last if it exists
            if (doneColumnEntry) {
                const [doneId, doneColumn] = doneColumnEntry;
                newColumns[doneId] = doneColumn;
            }

            // Return the updated projects state
            return {
                ...prevProjects,
                [projectId]: {
                    ...activeProject,
                    columns: newColumns
                }
            };
        });
    }
    catch{
        toast.error("Error adding column");
    }
    finally{
       onClose()
    }
  },[userId,companyId]);

  // --- Start of Corrected editColumn ---
  const editColumn = useCallback( async ({columnId, newName, projectId} : {columnId: string, newName: string, projectId: string}) => { // Renamed 'name' to 'newName'

    // Assuming userId and companyId are available in the component's scope (e.g., from context or props)
    // If not, they need to be passed in or retrieved differently.
    if(!userId || !companyId || !columnId || !projectId ) {
        console.error("Missing required IDs for editing column");
        toast.error("Cannot update column: Missing information.");
        return;
    }

    if(!newName || newName.trim() === "") { // Check if newName is empty or just whitespace
        toast.warn("Column name cannot be empty.");
        return;
    }

    // Construct the correct API endpoint
    const apiUrl = `/api/v1/${userId}/companies/${companyId}/to-do/${projectId}/${columnId}/edit`;

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }), // Send newName in the body
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" })); // Try to get error details
        toast.error(`Error updating column: ${errorData.message || response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optimistic UI update or update based on response if needed
      // The current logic updates the state immediately

      setProjects((currentProjects: TaskBoard | undefined) => {
        if (!currentProjects) return currentProjects;

        const projectToUpdate = currentProjects[projectId];
        if (!projectToUpdate || !projectToUpdate.columns) return currentProjects;

        // Ensure the specific column exists before trying to update
        if (!projectToUpdate.columns[columnId]) {
            console.error(`Column with ID ${columnId} not found in project ${projectId}`);
            return currentProjects; // Return current state if column not found
        }

        // Create a new columns object with the updated column name
        const updatedColumns = {
          ...projectToUpdate.columns, // Copy existing columns
          [columnId]: { // Target the specific column
            ...projectToUpdate.columns[columnId], // Copy the existing column properties
            name: newName, // Update the name
          },
        };

        // Return the updated projects state
        return {
          ...currentProjects,
          [projectId]: {
            ...projectToUpdate,
            columns: updatedColumns, // Assign the updated columns object
          },
        };
      });

      toast.success("Column updated successfully!"); // Success feedback

    } catch (error) { // Added error parameter
      console.error("Error updating column:", error); // Log the actual error
      // Avoid duplicate toast if already handled above
      if (!(error instanceof Error && error.message.startsWith("HTTP error!"))) {
          toast.error("An unexpected error occurred while updating the column.");
      }
    }
  }, [userId, companyId, setProjects]); 

  const checkTask = useCallback(async (task_id: string, project_id: string,checked : boolean) => {
    if(!userId) return;
    if (!task_id || !project_id) {
        console.error("Missing required IDs for checking task");
        toast.error("Cannot check task: Missing information.");
        return;
    }

    try {
        const response = await fetch(
            `/api/v1/${userId}/companies/${companyId}/to-do/${project_id}/check-task`,
            {
                method: "PUT",
                body: JSON.stringify({ task_id, checked }),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Optimistic UI update or update based on response if needed
        // The current logic updates the state immediately

        setProjects((currentProjects: TaskBoard | undefined) => {
          if (!currentProjects) return currentProjects;

          const projectToUpdate = currentProjects[project_id];
          // Check if project or columns exist before proceeding
          if (!projectToUpdate || !projectToUpdate.columns) {
              console.warn(`Project with ID ${project_id} or its columns not found.`);
              return currentProjects;
          }

          // Create a deep copy to avoid mutating the original state directly
          // Using structuredClone for better performance and handling of complex objects if available,
          // otherwise fallback to JSON parse/stringify. Consider browser compatibility.
          let updatedProjects;
          try {
            updatedProjects = structuredClone(currentProjects);
          } catch {
            console.warn("structuredClone not available, falling back to JSON.parse(JSON.stringify). This might be less performant or accurate for complex types.");
            updatedProjects = JSON.parse(JSON.stringify(currentProjects));
          }

          const updatedProject = updatedProjects[project_id];

          // Find the task and update its checked status
          let taskFound = false;
          for (const columnId in updatedProject.columns) {
            // Ensure the column exists and has a tasks array
            if (updatedProject.columns.hasOwnProperty(columnId) && Array.isArray(updatedProject.columns[columnId].tasks)) {
                const column = updatedProject.columns[columnId];
                // Use findIndex for efficiency
                const taskIndex = column.tasks.findIndex((task: Task) => task.id === task_id); // Assuming Task type has 'id'

                if (taskIndex !== -1) {
                  // Update the checked status of the found task
                  // Ensure the task object exists before updating
                  if (column.tasks[taskIndex]) {
                      column.tasks[taskIndex].checked = checked; // Assuming Task type has 'checked'
                      taskFound = true;
                      break; // Exit the inner loop once the task is found and updated in its column
                  }
                }
            }
          }

          if (!taskFound) {
            console.warn(`Task with ID ${task_id} not found in project ${project_id} for checking.`);
            return currentProjects; // Return original state if task not found
          }

          return updatedProjects; // Return the modified state
        })
      }
      catch{
        toast.error("Error checking task");
      }
  
  },[userId,companyId]);

  const updateStatus = useCallback(async (task_id: string, status: string, project_id: string,column_id: string) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `/api/v1/${userId}/companies/${companyId}/to-do/${project_id}/update-task-status`,
        {
          method: "PUT",
          body: JSON.stringify({ task_id, status,column_id }),
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      toast.error("Error updating task status");
      console.error(error);
    }
  }, [companyId, userId]);

  const deleteColumn = useCallback(async (columnId: string, projectId: string) => {
    try {
      // --- Initial Checks ---
      const project = projects?.[projectId];
      if (!project || !project.columns) {
        toast.error("Project data not found."); return;
      }
      const columnToDelete = project.columns[columnId];
      if (!columnToDelete) {
        toast.error("Column not found."); return;
      }

      const statusToDelete = columnToDelete.tasksStatus;
      const tasksToMove = columnToDelete.tasks || [];
      const allProjectColumns = Object.values(project.columns);
      const otherColumnsWithSameStatus = allProjectColumns.filter(
        (col) => col.id !== columnId && col.tasksStatus === statusToDelete
      );

      // --- Determine Deletion Path & Pre-checks ---
      let allowDeletion = false;
      let distributeTasks = false; // Flag for special "All" case task distribution
      let moveTasksToOneTarget = false; // Flag for normal task moving
      let targetColumn: Column | undefined = undefined;
      let targetColumnId: string | undefined = undefined;
      const taskDistribution: Map<string, { targetCol: Column | undefined, tasks: Task[] }> = new Map(); // For distribution case

      if (statusToDelete === "All" && otherColumnsWithSameStatus.length === 0 && tasksToMove.length > 0) {
        // Scenario 1: Special "All" Case (with tasks) -> Check if distributable
        console.log("Checking special 'All' column deletion case (with tasks)...");
        const availableTargetColumns = allProjectColumns.filter(col => col.tasksStatus !== "All");
        let canDistributeAll = true;
        for (const task of tasksToMove) {
            const taskStatus = task.task_status;
            if (!taskStatus) { toast.error(`Task "${task.title}" has no status.`); canDistributeAll = false; break; }
            const targetCol = availableTargetColumns.find(col => col.tasksStatus === taskStatus);
            if (!targetCol) { toast.error(`No target column for status '${taskStatus}'.`); canDistributeAll = false; break; }
            const targetColId = targetCol.id;
            if (!taskDistribution.has(targetColId)) { taskDistribution.set(targetColId, { targetCol: targetCol, tasks: [] }); }
            taskDistribution.get(targetColId)!.tasks.push(task);
        }

        if (canDistributeAll) {
            allowDeletion = true;
            distributeTasks = true;
            console.log("Tasks can be distributed.");
        } else {
            console.log("Tasks cannot be distributed. Aborting deletion.");
            // Error toast already shown in loop
            return; // Abort
        }
      } else if (otherColumnsWithSameStatus.length === 0) {
        // Last column of its status
        if (statusToDelete === "All") {
            // Scenario 2: Last empty "All" column
            console.log("Allowing deletion of last empty 'All' column.");
            allowDeletion = true; // No task moving needed
        } else {
            // Scenario 3: Last column of other status
            if (tasksToMove.length > 0) {
                toast.error(`Cannot delete column: No other column found with status ${statusToDelete} to move tasks to.`);
            } else {
                toast.error(`Cannot delete the last column with status: ${statusToDelete}`);
            }
            return; // Prevent deletion
        }
      } else {
        // Scenario 4: Not the last column -> Normal move
        console.log("Allowing normal column deletion with task move.");
        allowDeletion = true;
        moveTasksToOneTarget = true;
        targetColumn = otherColumnsWithSameStatus[0];
        targetColumnId = targetColumn.id; // Safe here because length > 0
      }

      // --- Proceed with Deletion if Allowed ---
      if (!allowDeletion) {
          console.error("INTERNAL ERROR: Deletion was not allowed, but code proceeded."); // Should not happen
          return;
      }

      // API Call
      console.log(`Attempting API deletion for column ${columnId}`);
      const response = await fetch(`/api/v1/${userId}/companies/${companyId}/to-do/${projectId}/${columnId}/delete`, { method: "DELETE" });
      if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`; try { const d = await response.json(); errorMsg = d.message || errorMsg; } catch {} throw new Error(errorMsg);
      }
      console.log(`API deletion successful for column ${columnId}`);

      // Backend Task Updates (Conditional)
      try {
          if (distributeTasks) {
              console.log("Updating backend tasks for distribution...");
              const updatePromises: Promise<void>[] = [];
              taskDistribution.forEach(({ tasks }, targetColId) => {
                  tasks.forEach(task => {
                      // Ensure task.task_status is not undefined before calling updateStatus
                      if (task.task_status) {
                          updatePromises.push(updateStatus(task.id, task.task_status, projectId, targetColId));
                      } else {
                          // This case should have been caught earlier, but log just in case
                          console.warn(`Skipping backend update for task ${task.id} due to missing status.`);
                      }
                  });
              });
              await Promise.all(updatePromises);
              console.log("Backend distribution updates successful.");
          } else if (moveTasksToOneTarget && tasksToMove.length > 0 && targetColumnId) {
              console.log(`Updating backend tasks for move to ${targetColumnId}...`);
              const updatePromises = tasksToMove.map((task) =>
                  updateStatus(task.id, statusToDelete, projectId, targetColumnId!) // targetColumnId is safe here
              );
              await Promise.all(updatePromises);
              console.log("Backend move updates successful.");
          } else {
              console.log("No backend task updates needed.");
          }
      } catch (taskUpdateError) {
          console.error("Error updating backend tasks during column deletion:", taskUpdateError);
          toast.warn("Column deleted, but failed to update some tasks on the backend. Please check manually.");
          // Continue with frontend update regardless
      }


      // Frontend State Update
      console.log("Updating frontend state...");
      setProjects((prevProjects) => {
          if (!prevProjects?.[projectId]?.columns) return prevProjects;
          const updatedColumns = { ...prevProjects[projectId].columns };

          // Add tasks to target(s) based on flags
          if (distributeTasks) {
              taskDistribution.forEach(({ tasks }, targetColId) => {
                  if (updatedColumns[targetColId]) {
                      const targetColState = updatedColumns[targetColId];
                      updatedColumns[targetColId] = { ...targetColState, tasks: [...(targetColState.tasks || []), ...tasks] };
                  }
              });
              console.log("Tasks distributed in frontend state.");
          } else if (moveTasksToOneTarget && tasksToMove.length > 0 && targetColumnId && updatedColumns[targetColumnId]) {
              const targetColState = updatedColumns[targetColumnId];
              // Corrected typo: targetColId -> targetColumnId
              updatedColumns[targetColumnId] = { ...targetColState, tasks: [...(targetColState.tasks || []), ...tasksToMove] };
              console.log(`Tasks moved to frontend column ${targetColumnId}.`);
          }

          // Delete the original column
          delete updatedColumns[columnId];
          console.log(`Frontend column ${columnId} deleted.`);

          return { ...prevProjects, [projectId]: { ...prevProjects[projectId], columns: updatedColumns } };
      });

      toast.success("Column deleted successfully.");

    } catch (error) {
      // Consolidate error handling
      let message = "An unexpected error occurred while deleting the column.";
      if (error instanceof Error) {
          message = error.message.startsWith("HTTP error!") ? `Failed to delete column: ${error.message}` : (error.message || message);
      }
      toast.error(message);
      console.error("Error in deleteColumn:", error);
    }
  }, [projects, companyId, userId, updateStatus]);



  const dragDropTask = useCallback((
    task_id: string,
    newStatus: string,
    source_column_id: string,
    destination_column_id: string,
    activeProjectId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    if (!activeProjectId || !projects) return;

    const activeProject = projects[activeProjectId];
    if (!activeProject) return;

    const sourceColumn = activeProject.columns[source_column_id];
    const destColumn = activeProject.columns[destination_column_id];

    if (!sourceColumn.tasks || !destColumn.tasks) return;

    const taskToMove = sourceColumn.tasks.find(task => task.id === task_id);
    if (!taskToMove) return;

    const updatedTask: Task = {
      ...taskToMove,
      task_status: newStatus === "All" ? taskToMove.task_status : newStatus as any
    };

    setProjects(prevProjects => {
      if (!prevProjects) return prevProjects;

      const newSourceTasks = sourceColumn.tasks.filter(task => task.id !== task_id);
      const newDestTasks = [...destColumn.tasks.slice(0, destinationIndex), updatedTask, ...destColumn.tasks.slice(destinationIndex, destColumn.tasks.length)];

      return {
        ...prevProjects,
        [activeProjectId]: {
          ...activeProject,
          columns: {
            ...activeProject.columns,
            [source_column_id]: {
              ...sourceColumn,
              tasks: newSourceTasks
            },
            [destination_column_id]: {
              ...destColumn,
              tasks: newDestTasks
            }
          }
        }
      };
    });

    if(newStatus  !== "All") updateStatus(task_id, newStatus, activeProjectId, destination_column_id)
    else {
      if(taskToMove.task_status) updateStatus(task_id, taskToMove.task_status, activeProjectId, destination_column_id)
    }

  }, [projects, updateStatus]);

  const contextValue = useMemo(() => ({
    projects,
    isLoading,
    search,
    setSearch,
    updateStatus,
    dragDropTask,
    setProjects,
    AddColumn,
    deleteColumn,
    editColumn, // Ensure editColumn is included here
    checkTask,
  }), [projects, isLoading, search, setSearch, updateStatus, dragDropTask, AddColumn, deleteColumn, editColumn, checkTask]); // Add editColumn to dependencies

  return (
    <columnsContext.Provider value={contextValue}>
      {children}
    </columnsContext.Provider>
  );
}

// Memoize the provider to prevent unnecessary re-renders
const MemoizedColumnsProvider = React.memo(ColumnsProvider);

// Separate default export
export default MemoizedColumnsProvider;

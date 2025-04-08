"use client"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { TaskBoard } from "../types/type";
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
};

const columnsContext = createContext<ColumnsContextType>({
  projects: undefined,
  setProjects: () => {},
  isLoading: true,
  search: "",
  setSearch: () => {},
  updateStatus: async () => {},
  dragDropTask: () => {}
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
        `/api/v1/${userId}/companies/${companyId}/to-do/list/get-tasks-projects?search=${search}`
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
      task_status: newStatus as any
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
    
    updateStatus(task_id, newStatus, activeProjectId, destination_column_id);
  }, [projects, updateStatus]);

  const contextValue = useMemo(() => ({
    projects,
    isLoading,
    search,
    setSearch,
    updateStatus,
    dragDropTask,
    setProjects
  }), [projects, isLoading, search, setSearch, updateStatus, dragDropTask]);

  return (
    <columnsContext.Provider value={contextValue}>
      {children}
    </columnsContext.Provider>
  );
}

export default function MemoizedColumnsProvider(props: { 
  children: React.ReactNode;
  companyId: string;
}) {
  return <ColumnsProvider {...props} />;
}

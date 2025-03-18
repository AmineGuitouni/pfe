import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GeneratedTask } from "../types";
import useLocalStorage from "../../../../hooks/useLocalStorage";
import { sortTasks } from "../utils/taskSorter";

interface UseTasksProps {
  companyId: string;
  projectName: string;
  projectDescription: string;
}

export default function useTasks({
  companyId,
  projectName,
  projectDescription,
}: UseTasksProps) {
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { data: session } = useSession();

  const cacheKey = useMemo(()=>{
    return `tasks-${companyId}-${projectName}-${projectDescription}`
  },[companyId, projectName, projectDescription])
  const [cachedTasks, setCachedTasks] = useLocalStorage<GeneratedTask[]>(cacheKey, []);

    const _fetchTasks = useCallback(
        async (useCache: boolean, retries: number = 1) => {
            if (!session?.user.id) return;

            if (useCache && cachedTasks.length > 0) {
              console.log("using cache");
                setTasks(cachedTasks);
                setIsLoading(false);
                return;
            }
            // setCachedTasks([]);
            setIsLoading(true);
            let attempt = 0;
            while (attempt < retries) {
                try {
                  console.log("fetching tasks");
                    const response = await fetch(
                        `/api/v1/${session?.user.id}/companies/${companyId}/projects/tasks/generate`,
                        {
                            method: "POST",
                            body: JSON.stringify({ projectName, projectDescription }),
                        }
                    );
                    const result = await response.json();
                    console.log("result", result);
                    if (result.error) {
                        setError(result.error);
                        break;
                    } else {
                        const sortedData = sortTasks(result.data)
                        setTasks(sortedData);
                        console.log("caching tasks");
                        setCachedTasks(sortedData);
                        return;
                    }
                } catch {
                    attempt++;
                    if (attempt >= retries) {
                      setError("Something went wrong");
                    }
                     else {
                        await new Promise((resolve) => setTimeout(resolve, 1000 * 2**attempt));
                    }
                }
            }
        setIsLoading(false);

        },
        [companyId, session?.user.id, projectName, projectDescription, cachedTasks, setCachedTasks]
    );

  const fetchTasks = useCallback(async () => {
    _fetchTasks(true,3)
  },[_fetchTasks])

  const regenerateTasks = useCallback(async () => {
    _fetchTasks(false);
  }, [_fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);


  const deleteTask = useCallback((tasks: string[]) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.filter(task => !tasks.includes(task.title));
      const sortedNewTasks = sortTasks(newTasks);
      setCachedTasks(sortedNewTasks);
      return sortedNewTasks;
    });
    
  },[setCachedTasks])

  const editTask = useCallback((task: GeneratedTask, oldTaskId: number) => {
    setTasks(prevTasks => {
      const taskToEdit = prevTasks[oldTaskId];
      const newTasks = prevTasks.map((oldTask, idx)=>{
        if(idx === oldTaskId){
          return task
        }
        return {...oldTask, dependencies: oldTask.dependencies.map((d)=>{
          if(d === taskToEdit.title){
            return task.title
          }
          return d
        })}
      })
      const sortedNewTasks = sortTasks(newTasks);
      setCachedTasks(sortedNewTasks);
      return sortedNewTasks;
    })
  },[setCachedTasks])

  const addTask = useCallback((task: GeneratedTask) => {
    
    setTasks(prevTasks => {
      const newTasks = [...prevTasks, task];
      const sortedNewTasks = sortTasks(newTasks);
      setCachedTasks(sortedNewTasks);
      return sortedNewTasks;
    })
  },[setCachedTasks])

  return { tasks, isLoading, error, regenerateTasks, deleteTask, editTask, addTask };
}
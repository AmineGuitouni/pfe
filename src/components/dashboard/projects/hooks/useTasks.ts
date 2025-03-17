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


  const deleteTask = useCallback((taskIndex: number) => {
    setTasks(prevTasks => {
      if (taskIndex < 0 || taskIndex >= prevTasks.length) return prevTasks;
  
      const taskToDelete = prevTasks[taskIndex];
      const tasksToDelete = new Set<string>([taskToDelete.title]);
  
      // Find all dependent tasks recursively
      let hasChanged;
      do {
        hasChanged = false;
        prevTasks.forEach(task => {
          if (tasksToDelete.has(task.title)) return; // Already marked for deletion
          if (task.dependencies.some(dep => tasksToDelete.has(dep))) {
            tasksToDelete.add(task.title);
            hasChanged = true;
          }
        });
      } while (hasChanged);
  
      // Filter out deleted tasks and update cache
      const newTasks = prevTasks.filter(task => !tasksToDelete.has(task.title));
      setCachedTasks(newTasks);
      return newTasks;
    });
  },[setCachedTasks])

  return { tasks, isLoading, error, regenerateTasks, deleteTask };
}
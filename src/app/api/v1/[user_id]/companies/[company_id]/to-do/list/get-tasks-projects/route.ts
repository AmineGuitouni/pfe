import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";
import { statusForCol, TaskBoard, toDoProject } from "@/components/to-do/types/type";
import { Task } from "@/components/dashboard/projects/types";

export async function GET(req: NextRequest, {params: {company_id, user_id}}: {params: { company_id: string, user_id: string}}) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const client = await getServerDBfromCompanyId(company_id);
  
  if (!client) {
    return NextResponse.json({ data: {}, error: "Failed to connect to database" });
  }

  let query = client
    .from('projects')
    .select(`
       project_tasks(id,difficulty_level,title,description,status,dependencies:project_tasks_dependencies_main_task_id_fkey(dependent_task_id),project_user_tasks!inner(user_id)),*
    `)
    .eq('project_tasks.project_user_tasks.user_id', user_id)
    .eq('company_id', company_id);

  if (search) {
    query = query.or(`name.ilike.%${search}%`);
  }

  const { data, error} = await query as any;

  if (error) {
    console.error(error);
    return NextResponse.json({ data: {}, error: error.message });
  }
  
  // Initialize the TaskBoard
  const taskBoard: TaskBoard = {};

  // Process each project
  data.forEach((project: any) => {
    // First, create the task map with dependencies
    const tasksMap = project.project_tasks?.reduce((acc: any, task: any) => {
      return {
        ...acc,
        [task.id]: {
          ...task,
          dependencies: task.dependencies.map((dep: any) => dep.dependent_task_id)
        }
      };
    }, {} as any) || {};

    // Convert tasks to the Task type with Record structure
    const processedTasks: Record<string, Task> = {};
    
    Object.values(tasksMap).forEach((task: any) => {
      // Get dependency titles
      const dependencyTitles = task.dependencies.map((depId: string) => {
        const dependentTask = tasksMap[depId];
        return dependentTask ? dependentTask.title : `Unknown Task (${depId})`;
      });

      // Create the processed task
      processedTasks[task.id] = {
        id: task.id,
        title: task.title,
        description: task.description,
        task_status: task.status,
        dependencies: dependencyTitles,
        difficultyLevel: task.difficulty_level
      };
    });

    // Create task records filtered by status
    const todoTasks: Record<string, Task> = {};
    const completedTasks: Record<string, Task> = {};

    Object.entries(processedTasks).forEach(([taskId, task]) => {
      if (task.task_status === "To Do") {
        todoTasks[taskId] = task;
      } else if (task.task_status === "Completed") {
        completedTasks[taskId] = task;
      }
    });

    // Create the toDoProject structure
    const toDoProject: toDoProject = {
      projectData: {
        id: project.id,
        name: project.name,
        description: project.description,
        deadline: project.deadline,
        tasks_count: Object.keys(processedTasks).length,
        project_status: project.status || "In Progress",
        created_at: project.created_at
      },
      columns: {
        "todo": {
          id: "todo",
          name: "To Do",
          tasks: todoTasks,
          tasksStatus: "To Do" as statusForCol
        },
        "done": {
          id: "done",
          name: "Done",
          tasks: completedTasks,
          tasksStatus: "Completed" as statusForCol
        }
      }
    };

    // Add to the TaskBoard using project ID as key
    taskBoard[project.id] = toDoProject;
  });

  return NextResponse.json({ data: taskBoard });
}

import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";
import { Column, statusForCol, TaskBoard, toDoProject } from "@/components/to-do/types/type";
import { Task } from "@/components/dashboard/projects/types";

export async function GET(req: NextRequest, {params: {company_id, user_id}}: {params: { company_id: string, user_id: string}}) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const client = await getServerDBfromCompanyId(company_id);
  
  if (!client) {
    return NextResponse.json({ data: {}, error: "Failed to connect to database" });
  }

  // First, fetch all columns
  const { data: columnsData, error: columnsError } = await client
    .from('columns')
    .select('*');

  if (columnsError) {
    console.error(columnsError);
    return NextResponse.json({ data: {}, error: columnsError.message });
  }

  // Then fetch projects with tasks and their related data
  let query = client
    .from('projects')
    .select(`
       project_tasks(id,difficulty_level,title,description,status,column_id,dependencies:project_tasks_dependencies_main_task_id_fkey(dependent_task_id),project_user_tasks!inner(user_id)),*
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

  // Create a map of columns by ID for easier lookup
  const columnsMap = columnsData.reduce((acc: Record<string, any>, column: any) => {
    acc[column.id] = column;
    return acc;
  }, {});

  // Find or create standard columns
  const findColumnByStatus = (status: string) => {
    return columnsData.find((col: any) => col.task_status === status);
  };

  const todoColumn = findColumnByStatus("To Do");
  const doneColumn = findColumnByStatus("Completed");

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

    // Collect the unique column IDs used by this project's tasks
    const projectColumns: Record<string, Column> = {};
    const projectColumnIds = new Set<string>();
    
    project.project_tasks?.forEach((task: any) => {
      if (task.column_id) {
        projectColumnIds.add(task.column_id);
      }
    });

    // Create an ordered array of column IDs with "To Do" first and "Done" last
    const orderedColumnIds: string[] = [];
    
    // Add To Do column first
    if (todoColumn) {
      orderedColumnIds.push(todoColumn.id);
    }
    
    // Add other columns in the middle
    projectColumnIds.forEach(columnId => {
      // Skip To Do and Done columns as they are handled separately
      if (
        (todoColumn && columnId === todoColumn.id) || 
        (doneColumn && columnId === doneColumn.id)
      ) {
        return;
      }
      orderedColumnIds.push(columnId);
    });
    
    // Add Done column last
    if (doneColumn) {
      orderedColumnIds.push(doneColumn.id);
    }
    
    // If no columns were found, use default To Do and Done columns
    if (orderedColumnIds.length === 0) {
      // Create default To Do column
      projectColumns["todo"] = {
        id: "todo",
        name: "To Do",
        tasks: {},
        tasksStatus: "To Do" as statusForCol
      };
      
      // Create default Done column
      projectColumns["done"] = {
        id: "done",
        name: "Done",
        tasks: {},
        tasksStatus: "Completed" as statusForCol
      };
    } else {
      // Create columns in the ordered sequence
      orderedColumnIds.forEach(columnId => {
        const columnData = columnsMap[columnId];
        if (columnData) {
          projectColumns[columnId] = {
            id: columnId,
            name: columnData.name || "Unnamed Column",
            tasks: {},
            tasksStatus: (columnData.task_status || "To Do") as statusForCol
          };
        }
      });
    }

    // Assign tasks to their respective columns
    Object.entries(processedTasks).forEach(([taskId, task]) => {
      const taskData = tasksMap[taskId];
      
      // If task has a column_id and that column exists in our project columns
      const taskColumnId = taskData.column_id;
      if (taskColumnId && projectColumns[taskColumnId] ) {
        projectColumns[taskColumnId].tasks[taskId] = task;
      } else {
        // Default: put the task in the first To Do column
        const todoColumnId = todoColumn ? todoColumn.id : "todo";
        if (projectColumns[todoColumnId]) {
          projectColumns[todoColumnId].tasks[taskId] = task;
        }
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
      columns: projectColumns
    };

    // Add to the TaskBoard using project ID as key
    taskBoard[project.id] = toDoProject;
  });

  return NextResponse.json({ data: taskBoard });
}

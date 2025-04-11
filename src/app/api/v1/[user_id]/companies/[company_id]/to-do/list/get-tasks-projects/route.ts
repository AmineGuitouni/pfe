import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";
import { Column, TaskBoard, toDoProject } from "@/components/to-do/types/type";

export async function GET(req: NextRequest, {params: {company_id, user_id}}: {params: { company_id: string, user_id: string}}) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const client = await getServerDBfromCompanyId(company_id);
  
  if (!client) {
    return NextResponse.json({ data: {}, error: "Failed to connect to database" });
  }

  // Then fetch projects with tasks and their related data
  let query = client
    .from('projects')
    .select(`
       project_tasks(id,difficulty_level,title,description,task_status,column_id,dependencies:project_tasks_dependencies_main_task_id_fkey(dependent_task_id),project_user_tasks!inner(user_id)),*
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

  const {data : columnsData,error :errorData} = await client
  .from('columns')
  .select('*')
  .eq('company_id', company_id)

  if (errorData) {
    console.error(errorData);
    return NextResponse.json({ data: {}, error: errorData.message });
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
    const columns: Record<string, Column> = columnsData.filter((col: any) => col.project_id === project.id).reduce((acc: any, col: any) => {
      return {
        ...acc,
        [col.id]: {
          id: col.id,
          name: col.name,
          tasks: [],
          tasksStatus: col.task_status,
        }
      };
    }, {});	
    
    Object.values(tasksMap).forEach((task: any) => {
      if(task.column_id){
        columns[task.column_id] = {
          ...columns[task.column_id],
          tasks: [
            ...(columns[task.column_id]?.tasks || []),
            task
          ]
        };
      }
    });

    // Create the toDoProject structure
    const toDoProject: toDoProject = {
      projectData: {
        id: project.id,
        name: project.name,
        description: project.description,
        deadline: project.deadline,
        tasks_count: Object.keys(tasksMap).length,
        project_status: project.status || "In Progress",
        created_at: project.created_at
      },
      columns
    };

    // Add to the TaskBoard using project ID as key
    taskBoard[project.id] = toDoProject;
  });

  
  return NextResponse.json({ data: taskBoard });
}

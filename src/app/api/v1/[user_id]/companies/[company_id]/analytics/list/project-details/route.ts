export const fetchCache = "force-no-store";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";
import { TaskStatusType } from "@/components/dashboard/projects/types"; 

interface params {
    user_id: string;
    company_id: string;
}

interface RawUser { // Renamed from RawWorkerDetails for clarity
    id: string;
    first_name: string;
    last_name: string;
    image: string | null;
}

interface RawProjectUserTask {
    user_id: string;
    task_id: string;
    users: RawUser | null; // Should be a single user object, not an array based on schema
}

interface RawProjectTask { // Renamed from RawTask for clarity
    id: string;
    task_status: TaskStatusType | string;
    project_user_tasks: RawProjectUserTask[] | null; // Nested user tasks
}

interface RawProject {
    id: string;
    name: string; // Keep name for potential future use or debugging
    deadline: string | null;
    created_at: string;
    project_tasks: RawProjectTask[] | null; // Renamed from 'tasks' and now contains nested data
}

// Define the required output structure
type projectData = {
  workers: {
    user_id: string; // Added user_id for easier mapping
    first_name: string;
    last_name: string;
    image: string | null;
    tasks_done: number;
    tasks_per_week: number;
    tasks_rate: number;
    tasks_assigned: number; // Added tasks_assigned count
  }[];
  task_count: number;
  id_project: string;
  deadline: string | null;
  tasks_done: number;
  tasks_to_do: number;
  tasks_blocked: number;
  created_at_project: string;
  tasks_per_week: number;
  tasks_rate: number;
};

// Helper function to calculate duration in weeks safely
const calculateDurationInWeeks = (start: string, end: string | null): number | null => {
    if (!end) return null;
    try {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate <= startDate) {
            return null; // Invalid dates or end date is not after start date
        }
        const durationMillis = endDate.getTime() - startDate.getTime();
        const durationWeeks = durationMillis / (1000 * 60 * 60 * 24 * 7);
        return durationWeeks > 0 ? durationWeeks : null; // Ensure duration is positive
    } catch (e) {
        console.error("Error parsing dates:", e);
        return null;
    }
};

export async function GET(request: Request, { params: { company_id, user_id } }: { params: params }) {
    const supabase = await getServerDBfromCompanyId(company_id, user_id);

    if (!supabase) return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
    const now = new Date()
    const tomorrow  = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Corrected query to fetch projects with nested tasks, user tasks, and users
    const { data: rawProjects, error }: { data: RawProject[] | null, error: any } = await supabase
        .from("projects")
        .select(`
            id,
            name,
            deadline,
            created_at,
            project_tasks (
                id,
                task_status,
                project_user_tasks (
                    user_id,
                    task_id,
                    users (
                        id,
                        first_name,
                        last_name,
                        image
                    )
                )
            )
        `)
        .eq("company_id", company_id)
        .gte("deadline", tomorrow.toISOString()) 
        .not("deadline", "is", null) 
        .order("created_at", { ascending: true })

    if (error) {
        console.error("Supabase query error:", error);
        return NextResponse.json({ error: `Failed to get projects: ${error.message}` }, { status: 500 });
    }

    if (!rawProjects) {
         return NextResponse.json({ data: [] }); // Return empty array if no projects found
    }

    // Process the fetched data using the corrected structure
    const processedProjectDataArray: projectData[]   = rawProjects.map((project: RawProject) => {

        const projectTasks = project.project_tasks || []; // Use the corrected field name

        // --- Project Level Calculations ---
        const task_count = projectTasks.length;
        const tasks_done = projectTasks.filter((task: RawProjectTask) => task.task_status === 'Completed').length;
        const tasks_to_do = projectTasks.filter((task: RawProjectTask) => task.task_status === 'To Do').length;
        // Assuming other statuses might exist, calculate blocked based on known statuses
        const tasks_in_progress = projectTasks.filter((task: RawProjectTask) => task.task_status === 'In Progress').length; // Example: Add other relevant statuses
        const tasks_blocked = task_count - tasks_done - tasks_to_do - tasks_in_progress; // Adjust calculation if needed
        const tasks_rate = task_count > 0 ? tasks_done / task_count : 0;

        const duration_in_weeks = calculateDurationInWeeks(project.created_at, project.deadline);
        const tasks_per_week = duration_in_weeks && duration_in_weeks > 0 ? tasks_done / duration_in_weeks : 0;

        // --- Worker Level Calculations ---
        const workersMap = new Map<string, {
            details: { user_id: string; first_name: string; last_name: string; image: string | null; };
            assigned_task_ids: Set<string>;
        }>();

        // Iterate through tasks and their user assignments
        projectTasks.forEach((task: RawProjectTask) => {
            const userTasks = task.project_user_tasks || [];
            userTasks.forEach((assignment: RawProjectUserTask) => {
                const userDetails = assignment.users; // Access nested user details

                if (userDetails) { // Ensure user details exist
                    if (!workersMap.has(assignment.user_id)) {
                        workersMap.set(assignment.user_id, {
                            details: {
                                user_id: userDetails.id,
                                first_name: userDetails.first_name,
                                last_name: userDetails.last_name,
                                image: userDetails.image
                            },
                            assigned_task_ids: new Set()
                        });
                    }
                    // Add the task_id associated with this user assignment
                    workersMap.get(assignment.user_id)!.assigned_task_ids.add(assignment.task_id);
                }
            });
        });

        const workersData = Array.from(workersMap.values()).map(workerInfo => {
            // Filter projectTasks based on the tasks assigned to this worker
            const worker_assigned_tasks = projectTasks.filter((task: RawProjectTask) => workerInfo.assigned_task_ids.has(task.id));
            const worker_assigned_task_count = worker_assigned_tasks.length;
            const worker_tasks_done = worker_assigned_tasks.filter((task: RawProjectTask) => task.task_status === 'Completed').length;
            const worker_tasks_rate = worker_assigned_task_count > 0 ? worker_tasks_done / worker_assigned_task_count : 0;
            const worker_tasks_per_week = duration_in_weeks && duration_in_weeks > 0 ? worker_tasks_done / duration_in_weeks : 0;

            // Calculate total tasks assigned to this worker for this project
            const tasks_assigned = workerInfo.assigned_task_ids.size;

            return {
                ...workerInfo.details, // Includes user_id, first_name, last_name, image
                tasks_done: worker_tasks_done,
                tasks_per_week: worker_tasks_per_week,
                tasks_rate: worker_tasks_rate,
                tasks_assigned: tasks_assigned, // Add the calculated count
            };
        });

        return {
            id_project: project.id,
            name: project.name,
            deadline: project.deadline,
            created_at_project: project.created_at,
            task_count: task_count,
            tasks_done: tasks_done,
            tasks_to_do: tasks_to_do,
            tasks_blocked: tasks_blocked, // Ensure this calculation is correct based on your TaskStatusType
            tasks_rate: tasks_rate,
            tasks_per_week: tasks_per_week,
            workers: workersData,
        };
    })

    return NextResponse.json({ data: processedProjectDataArray });
}
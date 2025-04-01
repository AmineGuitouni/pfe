import TaskItem from '@/components/dashboard/projects/components/assignement/showTaskItem';
import { Task, ProjectStatusType } from '@/components/dashboard/projects/types';
import { FaCalendarAlt } from 'react-icons/fa';
import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { notFound } from 'next/navigation';

interface Params {
    locale: string;
    company: string;
    project_id: string;
}

interface searchParams {
    filter?: string;
}

const calculatePercentage = (value: number, total: number): string => {
    return total > 0 ? ((value / total) * 100).toFixed(0) : '0';
};

const getStatusColor = (status: ProjectStatusType): string => {
    switch (status) {
        case "Not Started":
            return "bg-gray-500";
        case "In Progress":
            return "bg-yellow-600";
        case "Completed":
            return "bg-green-600";
        case "Cancelled":
            return "bg-red-600";
        default:
            return "bg-gray-500";
    }
};

// Updated function to include deadline check
const deriveProjectStatus = (tasks: Task[], deadline: string | null): ProjectStatusType => {
    // If deadline is null, status is "Not Started"
    if (deadline === null) {
        return "Not Started";
    }

    // If deadline exists, check task statuses
    if (!tasks || tasks.length === 0) {
        // If deadline exists but no tasks, consider it "Not Started" (or adjust as needed)
        return "Not Started";
    }

    const allCompleted = tasks.every(task => task.task_status === "Completed");
    if (allCompleted) {
        return "Completed";
    }

    // If not all completed, consider it "In Progress" (covers To Do, In Progress, Blocked)
    // The original check for anyInProgress is implicitly covered here.
    // If it's not 'Completed', and deadline is not null, it must be 'In Progress' based on the new logic.
    return "In Progress";
};

interface ApiResponse {
    projectData: {
        id: string;
        name: string;
        description: string;
        deadline: string | null;
    };
    tasksData: Task[];
}

export default async function ProjectPage({ params: { locale, company, project_id }, searchParams: { filter } }: { params: Params, searchParams: searchParams, baseUrl: string }) {
    const session = await getServerSession(authOptions);
    const user_id = session?.user?.id;

    if (!user_id) {
         console.error("User not authenticated");
         return <div className="container mx-auto p-5 text-red-500">Authentication required.</div>;
    }

    let apiData: ApiResponse | null = null;
    let fetchError: string | null = null;

    try {
        const baseUrl = process.env.VERCEL_URL ? (`https://${process.env.VERCEL_URL}`) : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const apiUrl = `${baseUrl}/api/v1/${user_id}/companies/${company}/projects/${project_id}/get`;
        const res = await fetch(apiUrl, { cache: 'no-store' });

        if (!res.ok) {
            const errorBody = await res.json();
            throw new Error(errorBody.error || `Failed to fetch project data: ${res.statusText}`);
        }
        apiData = await res.json();

    } catch (error: any) {
        console.error("Error fetching project page data:", error);
        fetchError = error.message || "An unexpected error occurred while fetching project data.";
        if (error.message.includes("not found")) {
             notFound();
        }
    }

    if (fetchError || !apiData) {
        return (
            <div className="container mx-auto p-5 text-red-500">
                <h1 className="text-2xl font-bold mb-4">Error Loading Project</h1>
                <p>{fetchError || "Could not load project data."}</p>
                <Link href={`/${locale}/dashboard/${company}/projects`} className="text-light_blue hover:underline mt-4 inline-block">
                    Return to Projects List
                </Link>
            </div>
        );
    }

    const projectData = apiData.projectData;
    const tasksData: Task[] = apiData.tasksData

    const totalTasks = tasksData.length;
    const completed = tasksData.filter(t => t.task_status === 'Completed').length;
    const inProgress = tasksData.filter(t => t.task_status === 'In Progress' || t.task_status === 'Blocked').length;
    const remaining = tasksData.filter(t => t.task_status === 'To Do').length;

    const stats = {
        totalTasks,
        completed,
        inProgress,
        remaining,
    };

    const completedPercentage = calculatePercentage(stats.completed, totalTasks);
    const inProgressPercentage = calculatePercentage(stats.inProgress, totalTasks);
    const remainingPercentage = calculatePercentage(stats.remaining, totalTasks);

    // Pass deadline to the updated function
    const projectStatus = deriveProjectStatus(tasksData, projectData.deadline);
    const statusColorClass = getStatusColor(projectStatus);

    const filteredTasks = tasksData.filter(task => {
        const currentFilter = filter || 'All Tasks';
        if (currentFilter === 'All Tasks') return true;
        return task.task_status === currentFilter;
    });

    const cardBaseClasses = "bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg transition-all duration-300";
    const cardHoverClasses = "hover:shadow-xl hover:border-white/20 hover:-translate-y-1";
    const statCardBaseClasses = "bg-white/5 p-4 rounded-lg border-l-4 shadow-sm transition-all duration-300";
    const statCardHoverClasses = "hover:shadow-md hover:bg-white/10";

    return (
        <div className="container mx-auto p-5 text-text-light font-poppins">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-5 border-b border-light_blue-500/20">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-light_blue to-light_blue-500 text-transparent bg-clip-text mb-4 sm:mb-0">
                    Project Dashboard: {projectData.name}
                </h1>
                <div className="flex items-center gap-5">
                    <div className={`status-badge px-3 py-1.5 rounded-full text-sm font-semibold text-white ${statusColorClass} shadow-md transition-transform duration-300 hover:-translate-y-0.5`}>
                        {projectStatus}
                    </div>
                    {projectData.deadline ? (
                        <div className="deadline flex items-center gap-1.5 font-medium text-light_blue-500">
                            <FaCalendarAlt />
                            <span>Deadline: {projectData.deadline}</span>
                        </div>
                    ) : (
                        <Link
                            href={`/dashboard/${company}/projects/${project_id}/assign-workers`}
                            className="assign-users-btn px-4 py-2 border border-transparent rounded-md cursor-pointer transition-all duration-300 font-medium text-white bg-light_blue hover:bg-light_blue-600 hover:-translate-y-0.5 shadow-md"
                        >
                            Assign Users
                        </Link>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className={`lg:col-span-2 ${cardBaseClasses} ${cardHoverClasses}`}>
                    <h2 className="text-2xl font-semibold mb-4 text-light_blue">Project Overview</h2>
                    <p className="text-light_blue-500 opacity-90">{projectData.description}</p>
                </div>

                <div className={`${cardBaseClasses} ${cardHoverClasses}`}>
                    <h2 className="text-2xl font-semibold mb-4 text-light_blue">Project Stats</h2>
                    <div className="grid gap-4">
                        <div className={`${statCardBaseClasses} border-light_blue-500 ${statCardHoverClasses}`}>
                            <div className="stat-label text-sm text-light_blue-500 mb-1">Total Tasks</div>
                            <div className="stat-value text-xl font-semibold">{stats.totalTasks}</div>
                        </div>
                        <div className={`${statCardBaseClasses} border-green-500 ${statCardHoverClasses}`}>
                            <div className="stat-label text-sm text-light_blue-500 mb-1">Completed</div>
                            <div className="stat-value text-xl font-semibold">
                                {stats.completed} <span className="text-green-500">({completedPercentage}%)</span>
                            </div>
                        </div>
                        <div className={`${statCardBaseClasses} border-yellow-500 ${statCardHoverClasses}`}>
                            <div className="stat-label text-sm text-light_blue-500 mb-1">In Progress</div>
                            <div className="stat-value text-xl font-semibold">
                                {stats.inProgress} <span className="text-yellow-500">({inProgressPercentage}%)</span>
                            </div>
                        </div>
                        <div className={`${statCardBaseClasses} border-red-500 ${statCardHoverClasses}`}>
                            <div className="stat-label text-sm text-light_blue-500 mb-1">Remaining (To Do)</div>
                            <div className="stat-value text-xl font-semibold">
                                {stats.remaining} <span className="text-red-500">({remainingPercentage}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${cardBaseClasses} mb-8`}>
                <h2 className="text-2xl font-semibold mb-5 text-light_blue">Tasks</h2>

                <div className="task-filters flex flex-wrap gap-2 mb-5">
                    {['All Tasks', 'To Do', 'In Progress', 'Blocked', 'Completed'].map((filterName) => (
                         <Link
                            key={filterName}
                            href={`?filter=${encodeURIComponent(filterName)}`}
                            scroll={false}
                            replace
                            className={`filter-btn px-4 py-2 border border-transparent rounded-md cursor-pointer transition-all duration-300 font-medium text-light_blue-500 bg-white/10 hover:bg-light_blue-500/80 hover:text-white hover:-translate-y-0.5 ${
                                (filter === filterName || (!filter && filterName === 'All Tasks')) ? 'bg-light_blue-500 text-white font-semibold border-light_blue-600 shadow-md' : 'hover:border-white/20'
                            }`}
                        >
                            {filterName}
                        </Link>
                    ))}
                </div>

                <div className="task-list grid gap-4">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                isHighlighted={false}
                            />
                        ))
                    ) : (
                        <p className="text-light_blue-500 italic">No tasks match the current filter.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

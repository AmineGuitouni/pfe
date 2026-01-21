"use client";
import { useState, useMemo, useEffect } from "react";
import { Spinner, Table, TableBody, TableColumn, TableHeader, Progress, TableRow, TableCell, Avatar, Tooltip } from "@heroui/react";
import { CalendarDaysIcon, UserGroupIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"; // Added ExclamationTriangleIcon
import { format, differenceInDays, differenceInWeeks } from 'date-fns'; // Added date-fns imports
import ProjectSelector from "./projectSelector";
// Removed unused Project type import
import useCompanyOverview, { projectData } from "../../hooks/useCompanyOverview"; // Import hook and type
// Removed unused formatShortDate import

// Removed mockProjects array

// Helper function to calculate progress percentage
const calculateProgress = (done: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
};

// Helper function to format rate as percentage string
const formatRate = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`;
};

// Helper function to calculate time elapsed percentage
const calculateTimeElapsedPercentage = (createdAtStr: string | null | undefined, deadlineStr: string | null | undefined): number | null => {
  if (!createdAtStr || !deadlineStr) {
    return null; // Cannot calculate without both dates
  }

  const createdAt = new Date(createdAtStr);
  const deadline = new Date(deadlineStr);
  const now = new Date();

  // Validate dates
  if (isNaN(createdAt.getTime()) || isNaN(deadline.getTime())) {
    return null; // Invalid date format
  }

  const totalDuration = deadline.getTime() - createdAt.getTime();

  // Handle invalid duration (deadline before or same as creation)
  if (totalDuration <= 0) {
    return null;
  }

  // Handle cases relative to current time
  if (now.getTime() < createdAt.getTime()) {
    return 0; // Project hasn't started yet
  }
  if (now.getTime() >= deadline.getTime()) {
    return 100; // Project deadline has passed
  }

  const elapsedDuration = now.getTime() - createdAt.getTime();
  const percentage = (elapsedDuration / totalDuration) * 100;

  return Math.round(percentage);
};
export default function OngoingProjectTable({ company_id }: { company_id: string }) { // Assume company_id is passed as prop

  const { projectAnalyticsData, loading, error } = useCompanyOverview(company_id);
  const [selectedProject, setSelectedProject] = useState<projectData | null>(null);

  // Effect to set the initial selected project once data loads
  useEffect(() => {
    if (projectAnalyticsData && projectAnalyticsData.length > 0 && !selectedProject) {
      setSelectedProject(projectAnalyticsData[0]);
    }
  }, [projectAnalyticsData, selectedProject]);

  const handleProjectSelect = (projectId: string) => {
    const project = projectAnalyticsData?.find(p => p.id_project === projectId) || null;
    setSelectedProject(project);
  };

  const columns = useMemo(
    () => [
      { key: "worker", label: "WORKER" },
      { key: "tasks_status", label: "TASKS (Done / Assigned)" },
      { key: "tasks_rate", label: "COMPLETION RATE" },
      { key: "tasks_per_week", label: "TASKS / WEEK" }, // Changed from RATE (/H)
      { key: "progress", label: "PROGRESS" },
    ],
    []
  );

  const cellClasses = "p-3 align-middle"; // Ensure vertical alignment


  if (error) {
    return (
      <div className="w-full h-auto bg-red-900/20 border border-red-700 text-red-300 rounded-lg p-6 text-center">
        <p className="font-semibold">Error loading project data:</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if ((!projectAnalyticsData || projectAnalyticsData.length === 0) && !loading) {
    return (
      <div className="w-full h-auto bg-white/5 rounded-lg p-6 text-center text-white/70">
        No project analytics data available for this company.
      </div>
    );
  }

  // Calculate overall project progress
  const overallProgress = selectedProject ? calculateProgress(selectedProject.tasks_done, selectedProject.task_count) : 0;
  const tasksToDo = selectedProject ? selectedProject.task_count - selectedProject.tasks_done - selectedProject.tasks_blocked : 0; // Calculate To Do based on others

  // Calculate time elapsed percentage
  const timeElapsedPercentage = selectedProject
    ? calculateTimeElapsedPercentage(selectedProject.created_at_project, selectedProject.deadline)
    : null;

  return (
    <div className="w-full h-full flex flex-col gap-8">
      <div className="flex flex-col gap-6 bg-white/5 rounded-lg p-6 text-white w-full dark">
        {loading && !projectAnalyticsData ? (
          <div className="animate-pulse">
            {/* Skeleton Header */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Project Title and Selector */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
                <div className="h-8 bg-gray-700/50 rounded w-1/4"></div>
              </div>
              {/* Stats Line */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
                <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
              </div>
            </div>

            {/* Skeleton Progress/Stats */}
            <div className="flex flex-col lg:flex-row justify-start items-start lg:items-center gap-5 mb-8">
              {/* Progress Bar and Details */}
              <div className="flex flex-col gap-2 flex-grow w-full lg:w-auto">
                <div className="flex justify-between text-sm">
                  <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
                </div>
                <div className="h-2 bg-gray-700/50 rounded w-full"></div>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto lg:flex-shrink-0">
                <div className="h-10 bg-gray-700/50 rounded w-full"></div>
                <div className="h-10 bg-gray-700/50 rounded w-full"></div>
                <div className="h-10 bg-gray-700/50 rounded w-full"></div>
                <div className="h-10 bg-gray-700/50 rounded w-full"></div>
              </div>
            </div>

            {/* Skeleton Worker Table */}
            <div>
              {/* Title */}
              <div className="flex justify-between items-center mt-4 mb-4">
                <div className="h-6 bg-gray-700/50 rounded w-1/2"></div>
              </div>
              {/* Table Structure */}
              <div className="w-full">
                {/* Header */}
                <div className="flex bg-gray-800/50 rounded-md p-3 mb-2">
                  <div className="h-4 bg-gray-700/50 rounded w-1/4 mr-2"></div> {/* Worker */}
                  <div className="h-4 bg-gray-700/50 rounded w-1/4 mr-2"></div> {/* Tasks Status */}
                  <div className="h-4 bg-gray-700/50 rounded w-1/6 mr-2"></div> {/* Rate */}
                  <div className="h-4 bg-gray-700/50 rounded w-1/6 mr-2"></div> {/* Tasks/Week */}
                  <div className="h-4 bg-gray-700/50 rounded w-1/6"></div>      {/* Progress */}
                </div>
                {/* Body */}
                <div>
                  {[...Array(4)].map((_, index) => ( // Render 4 skeleton rows
                    <div key={index} className="flex items-center p-3 border-b border-white/10">
                      {/* Worker Column */}
                      <div className="flex items-center gap-3 w-1/4 mr-2">
                        <div className="h-8 w-8 bg-gray-700/50 rounded-full flex-shrink-0"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-24"></div>
                      </div>
                      {/* Tasks Status */}
                      <div className="h-4 bg-gray-700/50 rounded w-1/4 mr-2"></div>
                      {/* Completion Rate */}
                      <div className="h-4 bg-gray-700/50 rounded w-1/6 mr-2"></div>
                      {/* Tasks/Week */}
                      <div className="h-4 bg-gray-700/50 rounded w-1/6 mr-2"></div>
                      {/* Progress */}
                      <div className="h-2 bg-gray-700/50 rounded w-1/6"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <> {/* Wrap existing content in a fragment */}
            {/* Header Section */}
            <div className="flex flex-col gap-4">
          {/* Project Title and Selector */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-xl font-semibold text-light_blue flex-grow truncate" title={selectedProject?.name}>
              {selectedProject?.name || "Select a Project"}
            </h2>
            <ProjectSelector
              projects={projectAnalyticsData} // Pass all projects
              selectedProjectId={selectedProject?.id_project || null}
              onProjectSelect={handleProjectSelect} // Use handler
            />
          </div>

          {selectedProject ? (
            <>
              {/* Time, Workers, Target */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70 text-sm">
                <div className="flex items-center gap-1">
                  <CalendarDaysIcon className="h-4 w-4 text-white/50" />
                  <span>Created: {format(new Date(selectedProject.created_at_project), 'MMM d, yyyy')}</span>
                  {selectedProject.deadline && (
                     <span className="ml-1">(Deadline: {format(new Date(selectedProject.deadline), 'MMM d, yyyy')})</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="h-4 w-4 text-white/50" />
                  <span>{selectedProject.workers.length} Worker{selectedProject.workers.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                   <CheckCircleIcon className="h-4 w-4 text-white/50" /> {/* Using CheckCircle for Target */}
                  <span>Target: {selectedProject.task_count} Tasks</span>
                </div>
              </div>

              {/* Progress Bar and Details Wrapper */}
              <div className="flex flex-col lg:flex-row justify-start items-start lg:items-center gap-5">
                {/* Progress Bar and Details */}
                <div className="flex flex-col gap-2 flex-grow w-full lg:w-auto">
                   <div className="flex justify-between text-white/70 text-sm">
                      <span>Progress: {selectedProject.tasks_done}/{selectedProject.task_count} ({overallProgress}%)</span>
                      {/* Display Time Elapsed Percentage */}
                      {timeElapsedPercentage !== null && (
                        <span>{timeElapsedPercentage}% time elapsed</span>
                      )}
                   </div>
                   <Progress
                      aria-label="Overall Project Progress"
                      value={overallProgress}
                      className="w-full"
                      color={
                        overallProgress < 30 ? "danger" : overallProgress < 70 ? "warning" : "success"
                      }
                    />
                   {/* Conditional Time Alert */}
                   {selectedProject && selectedProject.deadline && selectedProject.task_count > selectedProject.tasks_done && differenceInDays(new Date(selectedProject.deadline), new Date()) >= 0 && (() => { // Changed > 0 to >= 0
                     const remainingTasks = selectedProject.task_count - selectedProject.tasks_done;
                     const remainingDays = Math.max(1, differenceInDays(new Date(selectedProject.deadline), new Date())); // Ensure at least 1 day
                     const remainingWeeks = Math.max(1, differenceInWeeks(new Date(selectedProject.deadline), new Date(), { roundingMethod: 'ceil' })); // Ensure at least 1 week
                     const requiredRate = (remainingTasks / remainingWeeks).toFixed(1);

                     return (
                       <div className="flex items-center gap-1 text-red-400 text-xs mt-1 p-2 bg-red-900/20 rounded border border-red-700/50">
                         <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
                         <span>
                           Need {remainingTasks} more task{remainingTasks !== 1 ? 's' : ''} in {remainingDays} day{remainingDays !== 1 ? 's' : ''} (required rate: {requiredRate}/week)
                         </span>
                       </div>
                     );
                   })()}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-white/70 text-sm w-full lg:w-auto lg:flex-shrink-0">
                   <div className="text-center sm:text-left">
                      <span className="font-semibold text-white">{formatRate(selectedProject.tasks_rate)}</span>
                      <p className="text-white/50 text-xs">Completion Rate</p>
                   </div>
                    <div className="text-center sm:text-left">
                      <span className="font-semibold text-white">{selectedProject.tasks_per_week.toFixed(1)}/wk</span>
                      <p className="text-white/50 text-xs">Avg Tasks/Week</p>
                   </div>
                    <div className="text-center sm:text-left">
                      <span className="font-semibold text-white">{tasksToDo}</span>
                      <p className="text-white/50 text-xs">Tasks To Do</p>
                   </div>
                   <div className="text-center sm:text-left">
                      <span className="font-semibold text-white">{selectedProject.tasks_blocked}</span>
                       <p className="text-white/50 text-xs">Tasks Blocked</p>
                   </div>
                </div>
              </div>

              {/* Alert Message Placeholder - Needs calculation */}
              {/* <div className="flex items-center gap-1 text-yellow-400 text-xs mt-2">
                 <InformationCircleIcon className="h-4 w-4" />
                 <span>Need {tasksToDo} more tasks.</span>
              </div> */}
            </>
          ) : (
            <div className="text-center text-white/60 py-4">Please select a project to view details.</div>
          )}
        </div>

        {/* Worker Activity Section */}
        {selectedProject && (
          <>
            <div className="flex justify-between items-center mt-4">
               <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="text-amber-400">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                     </svg>
                  </span>
                  Worker Activity
               </h2>
               {/* Placeholder for active workers count */}
               {/* <span className="text-white/70 text-sm">X / {selectedProject.workers.length} workers currently active</span> */}
            </div>

            <Table
              aria-label={`Worker Activity for ${selectedProject.name}`}
              classNames={{
                base: "w-full", table: "w-full", thead: "rounded-md",
                tr: "hover:bg-white/10 border-b border-white/10", // Added border
                th: "bg-gray-800/50 text-gray-400 p-3 text-left text-xs font-medium uppercase tracking-wider", // Adjusted header style
                td: cellClasses, // Use defined cell classes
                wrapper: "bg-transparent rounded-lg", // Make wrapper transparent
              }}
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn key={column.key}>{column.label}</TableColumn>
                )}
              </TableHeader>
              <TableBody
                items={selectedProject.workers || []} // Use workers from selected project
                emptyContent={
                  <div className="p-4 text-center text-white/60">No workers assigned to this project.</div>
                }
                loadingContent={<Spinner size="lg" color="white" />}
                isLoading={loading} // Use the loading state from the hook
              >
                {(worker) => {
                  const workerProgress = calculateProgress(worker.tasks_done, worker.tasks_assigned);
                  return (
                    <TableRow key={worker.user_id}>
                      <TableCell className={cellClasses}>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={worker.image || undefined}
                            name={`${worker.first_name} ${worker.last_name}`}
                            size="sm"
                            className="flex-shrink-0"
                          />
                          <span className="font-medium truncate">{`${worker.first_name} ${worker.last_name}`}</span>
                        </div>
                      </TableCell>
                      <TableCell className={cellClasses}>
                        {worker.tasks_done} / {worker.tasks_assigned}
                      </TableCell>
                      <TableCell className={cellClasses}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          worker.tasks_rate > 0.7 ? 'bg-green-500/20 text-green-400' : worker.tasks_rate > 0.3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {formatRate(worker.tasks_rate)}
                        </span>
                      </TableCell>
                      <TableCell className={cellClasses}>
                        {worker.tasks_per_week.toFixed(1)} / wk
                      </TableCell>
                      <TableCell className={cellClasses}>
                        <Tooltip content={`${workerProgress}% Complete (${worker.tasks_done}/${worker.tasks_assigned})`}>
                          <Progress
                            aria-label={`${worker.first_name}'s Task Progress`}
                            value={workerProgress}
                            className="max-w-[150px]" // Limit width
                            color={
                              workerProgress < 30 ? "danger" : workerProgress < 70 ? "warning" : "success"
                            }
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </>
            )}
          </> // Close fragment
        )}
      </div>
    </div>
  );
}
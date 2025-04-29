import { ProjectStatusType } from "@/components/dashboard/projects/types";

export const deriveProjectStatus = (tasks: {task_status: string}[], deadline: string | null): ProjectStatusType => {
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

    return "In Progress";
};
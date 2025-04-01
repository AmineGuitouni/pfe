import { Popover, PopoverContent, PopoverTrigger, Spinner } from "@heroui/react";
import { toDoProject } from "../types/type";
import { FaCalendarAlt } from "react-icons/fa";

export default function ToDoHeader({ project, isLoading }: { project: toDoProject | undefined; isLoading: boolean }) {
  const formatDuration = (ms: number): string => {
    if (ms <= 0) return "Deadline passed";

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    const remainingDays = days % 7;
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;

    const parts = [];
    
    if (weeks > 0) {
      parts.push(`${weeks} week${weeks !== 1 ? "s" : ""}`);
    }
    if (remainingDays > 0) {
      parts.push(`${remainingDays} day${remainingDays !== 1 ? "s" : ""}`);
    }
    if (parts.length < 2 && remainingHours > 0) {
      parts.push(`${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`);
    }
    if (parts.length < 2 && remainingMinutes > 0) {
      parts.push(`${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`);
    }

    if (parts.length === 0) {
        if(remainingMinutes === 0){
            return "Deadline passed";
        }
        return `${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""} left`;
    }
    return parts.slice(0, 2).join(" and ") + " left";
  };

  const deadline = project?.projectData.deadline;
  const currentTime = new Date().getTime();
  const deadlineTime = deadline ? new Date(deadline).getTime() : 0;
  const duration = deadline ? deadlineTime - currentTime : 0;

  return (
    <div className="w-full h-[50px] border-b-1 border-white/20 px-5 flex-shrink-0">
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Spinner color="white" size="sm"/>
        </div>
      ) : project ? (
        <div className="w-full h-full flex justify-between gap-3 items-center">
          <div className="flex items-baseline gap-2 flex-shrink-0">
            <p className="text-white text-md">Project :</p>
            <p className="text-light_blue-500 text-md font-semibold">{project.projectData.name}</p>
            <Popover placement="bottom-start">
                <PopoverTrigger>
                    <p className="text-white/40 text-sm cursor-pointer">See details</p>
                </PopoverTrigger>
                <PopoverContent className="bg-dark_blue border-1 border-white/20">
                    <div className="px-1 py-2 max-w-[200px]">
                    <div className="text-small font-bold text-light_blue-500">{project.projectData.name}</div>
                    <div className="text-tiny text-white/50">{project.projectData.description}</div>
                    </div>
                </PopoverContent>
                </Popover>
          </div>
          <p className="flex items-baseline gap-2 flex-shrink-0 mr-2 text-light_blue">
            <FaCalendarAlt size={15} />
            Deadline :
            {
                deadline ? <> {project.projectData.deadline} <span className="text-white/40  text-sm">{formatDuration(duration) }</span></> : <>No deadline</>
            }
          </p>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-white/40 text-medium">No project selected</p>
        </div>
      )}
    </div>
  );
}
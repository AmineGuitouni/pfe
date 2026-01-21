import { Task, TaskStatusType } from "@/features/dashboard/projects/types";
import { cn, ModalBody, Progress } from "@heroui/react";
import React from "react";
import { FaListUl, FaRegClock, FaStar, FaTasks } from "react-icons/fa";
import { Rating } from "react-simple-star-rating";

export default function Information({task,dependncies,setTask}:{task : Task , dependncies : Task[],setTask : React.Dispatch<React.SetStateAction<Task>>}) {

    const taskStatus = ["To Do" , "In Progress" , "Blocked" , "Completed" ]
    
      // Function to get status color
    const getStatusColor = (status?: TaskStatusType) => {
        switch(status) {
          case "To Do": return "bg-light_blue-500";
          case "In Progress": return "bg-yellow-500";
          case "Blocked": return "bg-red-500";
          case "Completed": return "bg-green-500";
          default: return "bg-gray-500";
        }
      };
    
      // Function to get difficulty stars
    const getDifficultyColor = (level: number) => {
        switch(level) {
          case 1: return "#2dd4bf";
          case 2: return "#60a5fa";
          case 3: return "#facc15";
          case 4: return "#f87171";
          default: return "#a855f7";
        }
    };

    return (
        <ModalBody>
                {/* Task Status Indicator */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FaRegClock className="text-light_blue-500" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <span className="text-sm">
                      {task.checked ? "Checked" : "Unchecked"}
                    </span>
                  </div>
                  <Progress 
                    value={task.task_status === "Completed" || task.task_status === "Blocked" ? 100 : task.task_status === "In Progress" ? 50 : task.task_status === "To Do" ? 10 : 0}
                    className="h-2"
                    classNames={{
                      indicator: getStatusColor(task.task_status)
                    }}
                  />
                </div>
                
                {/* Task Description */}
                <div className="mb-6 bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaListUl className="text-light_blue-500" />
                    <h3 className="text-md font-medium">Description</h3>
                  </div>
                  <p className="text-white/80 whitespace-pre-line">
                    {task.description || "No description provided."}
                  </p>
                </div>
                
                {/* Difficulty Level */}
                <div className="mb-6 bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaStar className="text-light_blue-500" />
                    <h3 className="text-md font-medium">Difficulty Level</h3>
                  </div>
                  <Rating
                    initialValue={task.difficultyLevel}
                    readonly
                    SVGstyle={{display : "inline-block" }}
                    size={25}
                    fillColor={getDifficultyColor(task.difficultyLevel)}
                    emptyColor="#e4e5e9"
                    iconsCount={5}
                    />
                </div>
                
                {/* Dependencies */}
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTasks className="text-light_blue-500" />
                    <h3 className="text-md font-medium">Dependencies</h3>
                  </div>
                  {dependncies.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {dependncies.map((dep) => (
                        <li key={dep.id} onClick={() => setTask(dep)} className="text-white/80 cursor-pointer hover:underline">{dep.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white/60 italic">No dependencies</p>
                  )}
                </div>
                
                {/* Status Indicators */}
                <div className="mt-6 flex flex-wrap gap-4">
                  {
                    taskStatus.map( (status,index) =>(
                        <div key={index} className="flex items-center gap-2">
                        <div className={cn(`w-3 h-3 rounded-full `, status === task.task_status ? getStatusColor(task.task_status) : "bg-gray-500") }></div>
                        <span className="text-sm">{status}</span>
                    </div>
                    )

                    )
                  }
                  
                </div>
              </ModalBody>
    )
}
import { AiOutlineLink } from 'react-icons/ai';
import { Chip } from '@heroui/react';
import { Task, TaskStatusType } from '../../types'; // Import TaskStatusType

interface TaskItemProps {
  task: Task;
  isHighlighted: boolean;
}

const borderColors = ['#2dd4bf', '#60a5fa', '#facc15', '#f87171', '#a855f7'];

// Helper function to get status badge color for tasks
const getTaskStatusColor = (status: TaskStatusType): string => {
    switch (status) {
        case "To Do":
            return "bg-gray-500"; // Or another color for To Do
        case "In Progress":
            return "bg-yellow-600";
        case "Blocked":
            return "bg-red-600";
        case "Completed":
            return "bg-green-600";
        default:
            return "bg-gray-500"; // Default fallback
    }
};


export default function TaskItem({
  task,
  isHighlighted,
}: TaskItemProps) {

  const statusColorClass = task.task_status ? getTaskStatusColor(task.task_status) : null;

  return (
      <div
        className={`p-4 border-l-4 border border-white/20 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors duration-200 ${
          isHighlighted ? 'ring-1 ring-light_blue' : ''
        }`}
        style={{ borderLeftColor: borderColors[task.difficultyLevel - 1] }}
      >
        <div className="flex items-center justify-between mb-2"> {/* Added mb-2 for spacing */}
          <h3
            className="text-lg font-semibold"
            style={{ color: borderColors[task.difficultyLevel - 1] }}
          >{task.title}</h3>
           
           {
            task.task_status && (
              <Chip
                size="sm"
                variant="flat"
                className={`text-white ${statusColorClass}`}
                classNames={{
                  base: `border-none ${statusColorClass}`,
                  content: "text-white font-medium",
                }}
              >
                {task.task_status}
              </Chip>
            )
           }
        </div>
        <p className="text-gray-300 mt-2">{task.description}</p>
        {/* Dependencies Section - Kept as is, assuming it might be needed later or data structure changes */}
        <div className="flex items-center mt-3"> {/* Added mt-3 for spacing */}
          <AiOutlineLink size={16} style={{ color: 'rgb(107 114 128)', marginRight: '0.5rem' }} />
          <span className="text-sm text-gray-400">Dependencies:</span>
          {task.dependencies.length === 0 ? (
            <span className="text-sm text-gray-400 ml-1">None</span>
          ) : (
            <div className="flex flex-wrap ml-1"> {/* Added ml-1 */}
              {task.dependencies.map((dependency, index) => (
                <Chip
                  key={index}
                  size="sm"
                  variant="flat"
                  className="ml-1 mb-1" // Keep margin between chips
                  classNames={{
                    base: "bg-dark_blue text-light_blue border-light_blue",
                    content: "text-light_blue",
                  }}
                  // onClick={() => onDependencyClick(dependency)}
                >
                  {dependency}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};
import { cn } from "@heroui/react"; 

const levels = [
  { level: "Very easy", color: "bg-teal-400" },   
  { level: "Easy", color: "bg-blue-400" },   
  { level: "Medium", color: "bg-yellow-400" }, 
  { level: "Hard", color: "bg-red-400" },  
  { level: "Very Hard", color: "bg-purple-500" }, 
];

export default function ShowDiff() {
  return (
    <div className="flex justify-center  gap-2 p-2">
      {levels.map((item) => (
        
        <div key={item.level} className="flex items-center gap-1">
          
          <div
            className={cn("w-4 h-4 rounded-full", item.color)}
            aria-hidden="true" 
          ></div>

          <span className="text-sm text-white mr-2">
            {item.level}
          </span>

        </div>
      ))}
    </div>
  );
}
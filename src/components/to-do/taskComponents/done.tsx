import TaskItem from "./taskItem";

export default function Done() {
    return (
        <div className="w-[300px] h-fit flex flex-col bg-white/5 border-white/20 border-1 rounded-md p-3">
            <p className="text-light_blue text-md font-semibold mb-3">Done</p>
            <div className="w-full flex flex-col gap-2 mb-1">
                {/* <TaskItem/>
                <TaskItem/>
                <TaskItem/>
                <TaskItem/> */}
            </div>
        </div>
    )
}
import ToDoHeader from "./toDoHeader";
import ToDoSidebar from "./sidebar/toDoSidebar";
import TaskContainer from "./taskComponents/container";

export default function ToDoContainer() {
    return (

        <div className="w-full h-full flex  ">
            <div className="w-full h-full flex flex-col">
                <ToDoHeader/>
                <TaskContainer/>
            </div>
            <ToDoSidebar/>

        </div>
    )
}
import ProjectTaskList from "@/features/dashboard/projects/components/assignement/projectTaskList";
import UserCardContainer from "@/features/dashboard/projects/components/assignement/userCardContainer";
import TaskUserAssgnementProvider from "@/features/dashboard/projects/context/taskUserAssgnementContext";

interface Params { company: string, project_id: string }
export default function AssignWorkersPage ({params: {company, project_id}}: {params: Params}) {
    
    return(
        <div className="w-full h-full p-10 overflow-hidden">
            <div className="w-full h-full gap-5 flex justify-between">
                <TaskUserAssgnementProvider company_id={company} project_id={project_id}>             
                        <UserCardContainer company_id={company} project_id={project_id}/>
                        <ProjectTaskList/>
                </TaskUserAssgnementProvider>
            </div>
        </div>
    )
}
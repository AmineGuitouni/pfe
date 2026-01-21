import ToDoContainer from "@/features/to-do/components/toDoContainer";
import ColumnsProvider from "@/features/to-do/context/columnsContext";

export default function ToDoPage({params: {company}}: {params: {company: string}}) {    
    return (
        <div className="w-full h-full overflow-y-auto scrollbar-custom flex flex-col gap-5">
            <ColumnsProvider companyId={company}>
                <ToDoContainer />
            </ColumnsProvider>
        </div>
    );
}

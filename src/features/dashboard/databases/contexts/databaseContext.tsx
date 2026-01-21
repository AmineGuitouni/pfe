// "use client";

// import { createContext, Dispatch, SetStateAction, useContext } from "react";
// import useDataBases from "../hooks/useDataBases";
// import { Database } from "@/app/api/v1/[user_id]/databases/list/route";

// interface DatabaseContextType {
//     databases: Database[];
//     isLoading: boolean;
//     error: string | null;
//     setDatabases: Dispatch<SetStateAction<Database[]>>;
//     addDatabase: (database: Omit<Database, "id" | "created_at">) => Promise<Response | undefined>;
//     deleteDatabase: (databaseId: string) => Promise<Response | undefined>;
//     editDatabase: (databaseId: string, updatedDatabase: Omit<Database, "id" | "created_at">) => Promise<Response | undefined>
// }

// const databaseContext = createContext<DatabaseContextType | undefined>(undefined)

// export function useDatabaseContext(){
//     const context = useContext(databaseContext)
//     if(!context){
//         throw new Error("useDatabaseContext must be used within a DatabaseContextProvider")
//     }

//     return context
// }

// export default function DatabaseProvider({children, initialData}:{children: React.ReactNode, initialData: any}){
//     const data : DatabaseContextType = useDataBases()
//     return(
//         <databaseContext.Provider value={data}>
//             {children}
//         </databaseContext.Provider>
//     )
// }
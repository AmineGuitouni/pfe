import { BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useFilesContext } from "../hooks/useFilesContext";

export default function HeaderFolderPath() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const {company_id} = useFilesContext();

    const foldersList = useMemo(()=>{
        let foldersList: {id: string, name: string}[] = [];
        const data = searchParams.get("data");
        if(data) foldersList = JSON.parse(decodeURIComponent(data)).folders;

        return foldersList
    },[searchParams])

    return (
        <Breadcrumbs className="dark">
            <BreadcrumbItem onPress={()=>{
                router.push(`/dashboard/${company_id}/files`)
            }}>Root</BreadcrumbItem>
            {
                foldersList.map((folder, index)=>{
                    const newSearchParams = foldersList.slice(0, index + 1);
                    const params = {
                        folders: newSearchParams
                    }

                    const encodedData = encodeURIComponent(JSON.stringify(params));
                    return (
                        <BreadcrumbItem key={folder.id} onPress={()=>{
                            router.push(`/dashboard/${company_id}/files?data=${encodedData}`)
                        }}>{folder.name}</BreadcrumbItem>
                    )
                })
            }
        </Breadcrumbs>
    )
}
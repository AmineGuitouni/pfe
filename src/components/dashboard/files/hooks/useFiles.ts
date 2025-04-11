import { useCallback, useEffect, useState } from "react";
import { FileItem, FolderItem, StorageSearchParams } from "../types/filesTypes";
import { useSession } from "next-auth/react";
import { CreateFolderRequestBody } from "@/app/api/v1/[user_id]/companies/[company_id]/storage/folders/new/route";
import { useSearchParams } from "next/navigation";


export default function useFiles({company_id}:{company_id:string}){
    const [folders,setFolders] = useState<FolderItem[]>([]);
    const [files,setFiles] = useState<FileItem[]>([]);

    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [error] = useState<string | null>(null);

    const {data:session} = useSession();
    const searchParams = useSearchParams();

    const fetchFolders = useCallback(async ()=>{
      if(!session?.user.id) return
      try{
        setIsLoadingFolders(true)
        let currentFolderId: string|null = null

        const searchParamsData = searchParams.get("data");
        if(searchParamsData){
          const parsedData:StorageSearchParams = JSON.parse(decodeURIComponent(searchParamsData));
          currentFolderId = parsedData.folders.length ? parsedData.folders[parsedData.folders.length - 1].id : null;
        }

        const response = await fetch(`/api/v1/${session?.user.id}/companies/${company_id}/storage/folders/list?parent_id=${currentFolderId}`);
        if(!response.ok){
          const {error} = await response.json();
          throw new Error(error ? error : `HTTP error! status: ${response.status}`);
        }

        const {data, error} = await response.json();

        console.log({data, error})
        if(error){
          throw error
        }

        setFolders(data || []);
      }
      catch (error){
        console.log(error)
        throw error
      }
      finally {
        setIsLoadingFolders(false)
      }
    },[session?.user.id, company_id, searchParams])

    useEffect(()=>{
      fetchFolders();
    }, [fetchFolders])

    const addFolder = useCallback(async ({folderName, folderColor, parentFolderId}: CreateFolderRequestBody)=>{
      if(!session?.user.id) return
      try{
        const response = await fetch(`/api/v1/${session?.user.id}/companies/${company_id}/storage/folders/new`,{
          method:"POST",
          body:JSON.stringify({folderName, folderColor, parentFolderId})
        });
        if(!response.ok){
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const {data, error} = await response.json();

        console.log({data, error})
        if(error){
          throw error
        }

        const newFolder: FolderItem = {
          id: data.id,
          name: folderName,
          parent_id: parentFolderId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: session.user.id
        }

        setFolders(prev => [...prev, newFolder]);
      }
      catch (error){
        console.log(error)
        throw error
      }
    },[company_id, session?.user.id])

    const deleteFolder = useCallback(async (folderId: string)=>{
      if(!session?.user.id) return
      try{
        const response = await fetch(`/api/v1/${session?.user.id}/companies/${company_id}/storage/folders/${folderId}/delete`,{
          method:"DELETE",
        });

        if(!response.ok){
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setFolders(prev => prev.filter(folder => folder.id !== folderId));
      }
      catch (error){
        console.log(error)
        throw error
      }
    },[company_id, session?.user.id])

    const editFolder = useCallback(async (folderId: string, updates: { folderName?: string, folderColor?: string })=>{
      if(!session?.user.id) return
      try{
        const response = await fetch(`/api/v1/${session?.user.id}/companies/${company_id}/storage/folders/${folderId}/edit`,{
          method:"PATCH", // Assuming PATCH for partial updates
          headers: {
            'Content-Type': 'application/json',
          },
          body:JSON.stringify({
            name: updates.folderName,
          })
        });

        if(!response.ok){
          const {error} = await response.json();
          throw new Error(error ? error : `HTTP error! status: ${response.status}`);
        }

        const {error} = await response.json();

        if(error){
          throw error
        }

        // Update the folder in the local state
        setFolders(prev => prev.map(folder =>
          folder.id === folderId
            ? { ...folder, name: updates.folderName || folder.name, updated_at: new Date().toISOString() } // Update fields and timestamp
            : folder
        ));

      }
      catch (error){
        console.log(error)
        throw error
      }
    },[company_id, session?.user.id])

    return {
        folders,
        files,
        isLoading: isLoadingFolders,
        error,
        setFolders,
        setFiles,
        addFolder,
        deleteFolder,
        editFolder
    }
}
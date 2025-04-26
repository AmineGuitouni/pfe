import { useCallback, useEffect, useState } from "react";
import { FileItem, FolderItem, StorageSearchParams, FileUserAccessItem, AccessLevel } from "../types/filesTypes"; // Added FileUserAccessItem, AccessLevel
import { useSession } from "next-auth/react";
import { CreateFolderRequestBody } from "@/app/api/v1/[user_id]/companies/[company_id]/storage/folders/new/route";
import { GetFileAccessResponseBody } from "@/app/api/v1/[user_id]/companies/[company_id]/storage/files/[file_id]/access/get/route"; // Added GetFileAccessResponseBody
import { useSearchParams } from "next/navigation";


export default function useFiles({company_id}:{company_id:string}){
    const [folders,setFolders] = useState<FolderItem[]>([]);
    const [files,setFiles] = useState<FileItem[]>([]);

    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true); // Added loading state for files
    const [error, setError] = useState<string | null>(null); // Allow setting error

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
        const params = new URLSearchParams();
        if (currentFolderId) params.set("parent_id", currentFolderId);
        
        const response = await fetch(`/api/v1/${session?.user.id}/companies/${company_id}/storage/folders/list?${params.toString()}`);
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

    // Fetch Files function
    const fetchFiles = useCallback(async () => {
        if (!session?.user.id) return;
        try {
            setIsLoadingFiles(true);
            setError(null); // Clear previous errors
            let currentFolderId: string | null = null;

            const searchParamsData = searchParams.get("data");
            if (searchParamsData) {
                const parsedData: StorageSearchParams = JSON.parse(decodeURIComponent(searchParamsData));
                currentFolderId = parsedData.folders.length ? parsedData.folders[parsedData.folders.length - 1].id : null;
            }

            const query = searchParams.get("query");
            const params = new URLSearchParams();

            console.log({query, currentFolderId})
            if (query) params.set("query", query);
            if (currentFolderId) params.set("parent_id", currentFolderId);

            const response = await fetch(`/api/v1/${session?.user.id}/companies/${company_id}/storage/files/list?${params.toString()}`);
            if (!response.ok) {
                const { error: apiError } = await response.json();
                throw new Error(apiError || `HTTP error! status: ${response.status}`);
            }

            const { data, error: apiError } = await response.json();

            if (apiError) {
                throw new Error(apiError);
            }

            // Map API data to the frontend FileItem type
            const formattedFiles: FileItem[] = (data || []).map((file: any) => ({
                type: file.type,
                id: file.id,
                name: file.name,
                folder_id: file.folder_id,
                size: file.size,
                created_at: file.created_at,
                updated_at: file.updated_at,
                owner_id: file.owner_id,
                isShared: file.isShared
            }));

            setFiles(formattedFiles);
        } catch (err: any) {
            console.error("Error fetching files:", err);
            setError(err.message || "Failed to fetch files");
            setFiles([]); // Clear files on error
        } finally {
            setIsLoadingFiles(false);
        }
    }, [session?.user.id, company_id, searchParams]);


    useEffect(()=>{
      fetchFolders();
      fetchFiles(); // Fetch both folders and files
    }, [fetchFolders, fetchFiles]) // Add fetchFiles dependency

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

    // Add File function
    const addFile = useCallback(async (file: File, parentFolderId: string | null) => {
        if (!session?.user.id) throw new Error("User not authenticated");
        try {
            setError(null);
            const formData = new FormData();
            formData.append('file', file);
            if (parentFolderId) {
                formData.append('parentFolderId', parentFolderId);
            }

            const response = await fetch(`/api/v1/${session?.user.id}/companies/${company_id}/storage/files/new`, {
                method: "POST",
                body: formData, // Send FormData
            });

            if (!response.ok) {
                const { error: apiError } = await response.json();
                throw new Error(apiError || `HTTP error! status: ${response.status}`);
            }

            const { data, error: apiError } = await response.json();

            if (apiError) {
                throw new Error(apiError);
            }

            // Add the new file to the local state, conforming to FileItem type
            const now = new Date().toISOString();
            const newFile: FileItem = {
                type: file.type,
                id: data.id,
                name: file.name,
                folder_id: parentFolderId || null,
                size: file.size,
                created_at: now,
                updated_at: now,
                owner_id: session.user.id,
            };

            setFiles(prev => [...prev, newFile]);
            return newFile; // Return the newly added file info

        } catch (err: any) {
            console.error("Error adding file:", err);
            setError(err.message || "Failed to add file");
            throw err; // Re-throw error for handling in UI
        }
    }, [company_id, session?.user.id]);

    // Delete File function
    const deleteFile = useCallback(async (fileId: string) => {
        if (!session?.user.id) throw new Error("User not authenticated");
        try {
            setError(null);
            const response = await fetch(`/api/v1/${session?.user.id}/companies/${company_id}/storage/files/${fileId}/delete`, {
                method: "DELETE",
            });

            if (!response.ok) {
                 const { error: apiError } = await response.json();
                 // Handle specific errors like 404 Not Found
                 if (response.status === 404) {
                     console.warn(`File with ID ${fileId} not found for deletion.`);
                     // Remove from local state anyway if it exists there
                     setFiles(prev => prev.filter(file => file.id !== fileId));
                     return; // Exit gracefully
                 }
                 throw new Error(apiError || `HTTP error! status: ${response.status}`);
            }

             // Check for potential non-JSON success response if API returns only status 200/204
             if (response.status === 200 || response.status === 204) {
                setFiles(prev => prev.filter(file => file.id !== fileId));
             } else {
                 const { error: apiError } = await response.json(); // Should ideally not happen on success
                 if (apiError) {
                     throw new Error(apiError);
                 }
                 // If no error but unexpected body, still remove locally
                 setFiles(prev => prev.filter(file => file.id !== fileId));
             }

        } catch (err: any) {
            console.error("Error deleting file:", err);
            setError(err.message || "Failed to delete file");
            throw err; // Re-throw error for handling in UI
        }
    }, [company_id, session?.user.id]);

    // Edit File function (only renaming for now)
    const editFile = useCallback(async (fileId: string, newName: string) => {
        if (!session?.user.id) throw new Error("User not authenticated");
        if (!newName || newName.trim().length === 0) throw new Error("New file name cannot be empty");

        try {
            setError(null);
            const response = await fetch(`/api/v1/${session?.user.id}/companies/${company_id}/storage/files/${fileId}/edit`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName.trim() }),
            });

            if (!response.ok) {
                const { error: apiError } = await response.json();
                 if (response.status === 404) {
                     throw new Error("File not found");
                 }
                throw new Error(apiError || `HTTP error! status: ${response.status}`);
            }

            const { error: apiError } = await response.json(); // API returns message on success

            if (apiError) {
                throw new Error(apiError);
            }

            // Update the file in the local state
            // Update the file in the local state
            const now = new Date().toISOString();
            setFiles(prev => prev.map(file =>
                file.id === fileId
                    ? { ...file, name: newName.trim(), updated_at: now } // Update name and timestamp
                    : file
            ));

        } catch (err: any) {
            console.error("Error editing file:", err);
            setError(err.message || "Failed to edit file");
            throw err; // Re-throw error for handling in UI
        }
    }, [company_id, session?.user.id]);

    // Get File Download Link function
    const getFileDownloadLink = useCallback(async (fileId: string, expiresIn?: number): Promise<string> => {
        if (!session?.user.id) throw new Error("User not authenticated");
        if (!fileId) throw new Error("File ID is required");

        try {
            setError(null); // Clear previous errors potentially? Or maybe not for a simple fetch?

            let apiUrl = `/api/v1/${session?.user.id}/companies/${company_id}/storage/files/${fileId}/get-link`;

            // Append expiresIn search parameter if provided and valid
            if (expiresIn !== undefined && expiresIn > 0) {
                apiUrl += `?expires_in=${expiresIn}`;
            }

            const response = await fetch(apiUrl); // Use the potentially modified URL

            if (!response.ok) {
                const { error: apiError } = await response.json();
                 if (response.status === 404) {
                     throw new Error("File not found");
                 }
                throw new Error(apiError || `HTTP error! status: ${response.status}`);
            }

            const { data, error: apiError } = await response.json();

            if (apiError || !data?.signedUrl) {
                throw new Error(apiError || "Failed to retrieve download link from API response");
            }

            return data.signedUrl;

        } catch (err: any) {
            console.error("Error getting file download link:", err);
            setError(err.message || "Failed to get download link"); // Set error state
            throw err; // Re-throw error for handling in UI
        }
    }, [company_id, session?.user.id]);

    // Get File Access List function
    const getFileAccessList = useCallback(async (fileId: string): Promise<FileUserAccessItem[]> => {
        if (!session?.user.id) throw new Error("User not authenticated");
        if (!fileId) throw new Error("File ID is required");

        try {
            setError(null); // Clear previous errors

            const apiUrl = `/api/v1/${session?.user.id}/companies/${company_id}/storage/files/${fileId}/access/get`;

            const response = await fetch(apiUrl);

            if (!response.ok) {
                const { error: apiError } = await response.json();
                 if (response.status === 404) {
                     throw new Error("File not found or access denied"); // Or more specific error
                 }
                throw new Error(apiError || `HTTP error! status: ${response.status}`);
            }

            const { data, error: apiError }: GetFileAccessResponseBody = await response.json();

            if (apiError || !data) {
                throw new Error(apiError || "Failed to retrieve file access list from API response");
            }

            return data;

        } catch (err: any) {
            console.error("Error getting file access list:", err);
            setError(err.message || "Failed to get file access list"); // Set error state
            throw err; // Re-throw error for handling in UI
        }
    }, [company_id, session?.user.id]);

    // Edit File Access function
    const editFileAccess = useCallback(async (
        fileId: string,
        userToAdd: { user_id: string; access_level: AccessLevel }[],
        userToRemove: { user_id: string }[]
    ): Promise<void> => {
        if (!session?.user.id) throw new Error("User not authenticated");
        if (!fileId) throw new Error("File ID is required");

        try {
            setError(null); // Clear previous errors

            const apiUrl = `/api/v1/${session?.user.id}/companies/${company_id}/storage/files/${fileId}/access/edit`;

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userToAdd, userToRemove }),
            });

            if (!response.ok) {
                // Attempt to parse error even if response is not ok
                let apiError = `HTTP error! status: ${response.status}`;
                try {
                    const errorBody = await response.json();
                    apiError = errorBody.error || apiError;
                } catch (parseError) {
                    // Ignore if response body is not JSON or empty
                    console.warn("Error parsing response body:", parseError);
                }

                if (response.status === 404) {
                    throw new Error("File not found or you do not have permission to edit access");
                }
                throw new Error(apiError);
            }

            // Check for potential error message in success response (though API seems to return {} on success)
            try {
                 const { error: apiError } = await response.json();
                 if (apiError) {
                     throw new Error(apiError);
                 }
            } catch (e) {
                 console.warn("Error parsing response body:", e);
                 // If response is empty or not JSON, assume success based on status code
                 if (response.status !== 200 && response.status !== 204) {
                     console.warn("Edit file access response was not empty JSON but status was ok.");
                 }
            }

            // Optionally: Could refetch the access list here if needed immediately after edit
            // await getFileAccessList(fileId);

        } catch (err: any) {
            console.error("Error editing file access:", err);
            setError(err.message || "Failed to edit file access"); // Set error state
            throw err; // Re-throw error for handling in UI
        }
    }, [company_id, session?.user.id]);


    return {
        folders,
        files,
        isLoading: isLoadingFolders || isLoadingFiles, // Combined loading state
        isLoadingFolders, // Keep individual states if needed
        isLoadingFiles,   // Keep individual states if needed
        error,
        setFolders,
        setFiles,
        // Folder functions
        addFolder,
        deleteFolder,
        editFolder,
        // File functions
        addFile,
        deleteFile,
        editFile,
        getFileDownloadLink,
        getFileAccessList,
        editFileAccess, // Added
        // Refetch triggers (optional, could be useful)
        refetchFolders: fetchFolders,
        refetchFiles: fetchFiles,
    }
}
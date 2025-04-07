import { useState } from "react";
import { FileItem, FolderItem } from "../types/filesTypes";

// Dummy data for folders
const dummyFolders: FolderItem[] = [
  { type: 'folder', id: 'folder1', name: 'Documents', parent_id: null, created_at: new Date().toISOString(), owner_id: 'user1' },
  { type: 'folder', id: 'folder2', name: 'Images', parent_id: null, created_at: new Date().toISOString(), owner_id: 'user1' },
  { type: 'folder', id: 'folder3', name: 'Subfolder', parent_id: 'folder1', created_at: new Date().toISOString(), owner_id: 'user1' },
];

// Dummy data for files
const dummyFiles: FileItem[] = [
  { type: 'file', id: 'file1', name: 'Report.docx', folder_id: 'folder1', size: 12345, created_at: new Date().toISOString(), owner_id: 'user1' },
  { type: 'file', id: 'file2', name: 'Presentation.pptx', folder_id: 'folder1', size: 67890, created_at: new Date().toISOString(), owner_id: 'user1' },
  { type: 'file', id: 'file3', name: 'logo.png', folder_id: 'folder2', size: 1024, created_at: new Date().toISOString(), owner_id: 'user1' },
  { type: 'file', id: 'file4', name: 'Notes.txt', folder_id: 'folder3', size: 500, created_at: new Date().toISOString(), owner_id: 'user1' },
  { type: 'file', id: 'file5', name: 'RootFile.pdf', folder_id: null, size: 20480, created_at: new Date().toISOString(), owner_id: 'user1' },
];


export default function useFiles() {
    const [folders] = useState<FolderItem[]>(dummyFolders); // Removed setFolder
    const [files] = useState<FileItem[]>(dummyFiles); // Removed setFiles

    const [isLoading] = useState(false); // Keep isLoading, might be useful later. Removed setIsLoading
    const [error] = useState<string | null>(null); // Keep error state. Removed setError

    // Removed fetchData and useEffect as we are using dummy data
    return {
        folders,
        files,
        isLoading,
        error
    }
}
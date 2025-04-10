'use client';

import React, { createContext, useState, useMemo, ReactNode } from 'react';
import useFiles from '../hooks/useFiles';
import { FileItem, FolderItem, StorageSearchParams } from '../types/filesTypes';
import { CreateFolderRequestBody } from '@/app/api/v1/[user_id]/companies/[company_id]/storage/folders/new/route';
import { useSearchParams } from 'next/navigation';

export interface FilesContextType {
  files: FileItem[],
  setFiles : React.Dispatch<React.SetStateAction<FileItem[]>>,
  folders: FolderItem[],
  setFolders: React.Dispatch<React.SetStateAction<FolderItem[]>>,
  isLoading: boolean,
  searchTerm: string,
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>,
  addFolder: ({ folderName, folderColor, parentFolderId }: CreateFolderRequestBody) => Promise<void>,
  deleteFolder: (folderId: string) => Promise<void>,
  editFolder: (folderId: string, updates: { folderName?: string, folderColor?: string }) => Promise<void>,
  company_id: string,
  currentFolder: {id: string, name: string}|null
}

const FilesContext = createContext<FilesContextType | undefined>(undefined);

interface FilesProviderProps {
  children: ReactNode;
  company_id: string;
}

export const FilesProvider: React.FC<FilesProviderProps> = ({ children, company_id }) => {
  const {files, folders, error, isLoading,setFolders,setFiles, addFolder, deleteFolder, editFolder} = useFiles({company_id}) // Destructure editFolder
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();

  const currentFolder = useMemo(()=>{
    let currentFolderId: {id: string, name: string}|null = null

    const searchParamsData = searchParams.get("data");
    if(searchParamsData){
      const parsedData:StorageSearchParams = JSON.parse(decodeURIComponent(searchParamsData));
      currentFolderId = parsedData.folders.length ? parsedData.folders[parsedData.folders.length - 1] : null;
    }

    return currentFolderId
  },[searchParams])

  const contextValue = useMemo(() => ({
    files,
    isLoading,
    error,
    folders,
    searchTerm,
    setSearchTerm,
    setFolders,
    setFiles,
    addFolder,
    deleteFolder,
    editFolder,
    company_id,
    currentFolder
  }), [error, files, folders, isLoading, searchTerm, setFiles, setFolders,addFolder, deleteFolder, editFolder,company_id, currentFolder]);

  return (
    <FilesContext.Provider value={contextValue}>
      {children}
    </FilesContext.Provider>
  );
};

export { FilesContext };
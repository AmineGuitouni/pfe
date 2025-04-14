'use client';

import React, { createContext, useState, useMemo, ReactNode } from 'react';
import useFiles from '../hooks/useFiles';
import { FileItem, FolderItem, StorageSearchParams } from '../types/filesTypes';
import { CreateFolderRequestBody } from '@/app/api/v1/[user_id]/companies/[company_id]/storage/folders/new/route';
import { useSearchParams } from 'next/navigation';

export interface FilesContextType {
  // State
  files: FileItem[];
  folders: FolderItem[];
  isLoading: boolean; // Combined loading state
  isLoadingFolders: boolean; // Individual loading state
  isLoadingFiles: boolean; // Individual loading state
  error: string | null;
  searchTerm: string;
  company_id: string;
  currentFolder: { id: string; name: string } | null;

  // Setters (Direct state manipulation - use with caution)
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  setFolders: React.Dispatch<React.SetStateAction<FolderItem[]>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;

  // Folder Actions
  addFolder: ({ folderName, folderColor, parentFolderId }: CreateFolderRequestBody) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  editFolder: (folderId: string, updates: { folderName?: string; folderColor?: string }) => Promise<void>;

  // File Actions
  addFile: (file: File, parentFolderId: string | null) => Promise<FileItem>;
  deleteFile: (fileId: string) => Promise<void>;
  editFile: (fileId: string, newName: string) => Promise<void>;
  getFileDownloadLink: (fileId: string) => Promise<string>; // Added

  // Refetch Actions
  refetchFolders: () => Promise<void>; // Added
  refetchFiles: () => Promise<void>; // Added
}

const FilesContext = createContext<FilesContextType | undefined>(undefined);

interface FilesProviderProps {
  children: ReactNode;
  company_id: string;
}

export const FilesProvider: React.FC<FilesProviderProps> = ({ children, company_id }) => {
  const {
    files, folders, error, isLoading, isLoadingFolders, isLoadingFiles, // Added individual loading states
    setFolders, setFiles,
    addFolder, deleteFolder, editFolder,
    addFile, deleteFile, editFile, getFileDownloadLink, // Added file actions including get link
    refetchFolders, refetchFiles // Added refetch actions
  } = useFiles({ company_id });
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
    // State
    files,
    folders,
    isLoading,
    isLoadingFolders, // Added
    isLoadingFiles,   // Added
    error,
    searchTerm,
    company_id,
    currentFolder,

    // Setters
    setSearchTerm,
    setFolders,
    setFiles,

    // Folder Actions
    addFolder,
    deleteFolder,
    editFolder,

    // File Actions
    addFile,
    deleteFile,
    editFile,
    getFileDownloadLink, // Added

    // Refetch Actions
    refetchFolders, // Added
    refetchFiles,   // Added

  }), [
    files, folders, isLoading, isLoadingFolders, isLoadingFiles, error, searchTerm, company_id, currentFolder, // State dependencies
    setSearchTerm, setFolders, setFiles, // Setter dependencies
    addFolder, deleteFolder, editFolder, // Folder action dependencies
    addFile, deleteFile, editFile, getFileDownloadLink, // File action dependencies including get link
    refetchFolders, refetchFiles // Refetch action dependencies
  ]);

  return (
    <FilesContext.Provider value={contextValue}>
      {children}
    </FilesContext.Provider>
  );
};

export { FilesContext };
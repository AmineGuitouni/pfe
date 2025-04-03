'use client';

import React, { createContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { FileItem, FilesContextType } from '../types/filesTypes';
const FilesContext = createContext<FilesContextType | undefined>(undefined);

interface FilesProviderProps {
  children: ReactNode;
}

export const FilesProvider: React.FC<FilesProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTermState] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string>('/');

  const selectFile = useCallback((file: FileItem | null) => {
    setSelectedFile(file);
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
  }, []);

  const navigateToPath = useCallback((path: string) => {
    console.log("Navigating to:", path);
    setCurrentPath(path);
    setSearchTermState('');
  }, []);


  const contextValue = useMemo(() => ({
    files,
    selectedFile,
    isLoading,
    error,
    searchTerm,
    currentPath,
    selectFile,
    setSearchTerm,
    navigateToPath,
  }), [files, selectedFile, isLoading, error, searchTerm, currentPath, selectFile, setSearchTerm, navigateToPath]);

  return (
    <FilesContext.Provider value={contextValue}>
      {children}
    </FilesContext.Provider>
  );
};

export { FilesContext };
'use client';

import { useContext } from 'react';
import { FilesContext } from '../contexts/FilesProvider';
// Import FilesContextType later from context file or types file

export const useFiles = () => {
  const context = useContext(FilesContext);

  if (context === undefined) {
    throw new Error('useFiles must be used within a FilesProvider');
  }

  // Type assertion for now, refine later with FilesContextType
  return context as any; // Replace 'any' with FilesContextType
};
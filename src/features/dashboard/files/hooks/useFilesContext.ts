'use client';

import { useContext } from 'react';
import { FilesContext } from '../contexts/FilesProvider';

export const useFilesContext = () => {
  const context = useContext(FilesContext);

  if (context === undefined) {
    throw new Error('useFiles must be used within a FilesProvider');
  }

  return context
};
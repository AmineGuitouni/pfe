'use client';
import React, { useState } from 'react'; // Removed useMemo
// Removed useFilesContext import
import FileComponent, { FileSkeleton } from './fileComponent';
import FolderComponent, { FolderSkeleton } from './folderComponent';
// Removed useSearchParams import
import ManageAccessModal from './ManageAccessModal';
import { useDisclosure } from '@heroui/react';
import { FileItem, FolderItem } from '../types/filesTypes'; // Added FolderItem

// Define Props interface
interface FileCardContainerProps {
    files: FileItem[];
    folders: FolderItem[];
    isLoading: boolean;
    company_id: string; // Add company_id prop
}

const FileCardContainer: React.FC<FileCardContainerProps> = ({ files, folders, isLoading, company_id }) => { // Destructure props
  // Removed context hook call
  // Removed searchParams hook call
  const { isOpen: isOpenManageAccess, onOpen: onOpenManageAccess, onOpenChange: onOpenChangeManageAccess } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState<FileItem>();
  // Removed showSharedFiles state

  // Removed filtering logic (assuming files/folders passed are already filtered based on search/shared toggle)

  // Removed displayFiles useMemo

  if(isLoading){
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {
          Array.from({ length: 2 }).map((_, index) => <FolderSkeleton key={index} index={index} /> )
        }
        {
          Array.from({ length: 3 }).map((_, index) => <FileSkeleton key={index} index={index} loading /> )
        }
      </div>
    )
  }

  // Removed hook call from here

  // Use props directly for empty check
  if (files.length === 0 && folders.length === 0) {
    // Removed searchTerm check as filtering happens upstream
    return <p className="text-gray-400 text-center py-10">This folder is empty or no matching items found.</p>;
  }

  return (
    <>
      {/* Removed Toggle Button */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {
          folders.map((item, index) => ( // Use folders prop
          <FolderComponent key={item.id} folder={item} index={index}/>
        ))
      }
      {
        files.map((item, index) => ( // Use files prop
          <FileComponent key={item.id} file={item} index={index + folders.length} onAccessOpen={()=>{ // Use folders.length
            setSelectedFile(item);
            onOpenManageAccess();
          }}/>
        ))
      }
      {company_id && selectedFile && (
          <ManageAccessModal
              isOpen={isOpenManageAccess}
              onOpenChange={onOpenChangeManageAccess}
              fileId={selectedFile.id}
              fileName={selectedFile.name}
              companyId={company_id}
          />
      )}
      </div>
      {/* Manage Access Modal */}
      {company_id && selectedFile && ( // Removed duplicate modal block
          <ManageAccessModal
              isOpen={isOpenManageAccess}
              onOpenChange={onOpenChangeManageAccess}
              fileId={selectedFile.id}
              fileName={selectedFile.name}
              companyId={company_id}
          />
      )}
    </> // Removed duplicate modal block
  );
};

export default FileCardContainer;
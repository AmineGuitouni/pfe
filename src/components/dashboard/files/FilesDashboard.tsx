'use client';

import React, { useState, useMemo } from 'react'; // Import useState and useMemo
import { Button } from '@heroui/react'; // Import Button
import { useFilesContext } from './hooks/useFilesContext'; // Import context hook
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import react-icons
import AddFileButton from './components/AddFileButton';
import AddFolderButton from './components/AddFolderButton';
import FileCardContainer from './components/FileCardContainer';
import Search from './components/search';
import HeaderFolderPath from './components/headerFolderPath';

const FilesDashboard: React.FC = () => {
  const [showSharedFiles, setShowSharedFiles] = useState(true); // Keep state
  const { files, folders, isLoading, company_id } = useFilesContext(); // Consume context, added company_id

  // Filter files based on the showSharedFiles state here
  const displayFiles = useMemo(() => {
      return files.filter(file => showSharedFiles || !file.isShared);
  }, [files, showSharedFiles]);

  return (
    <div className="flex flex-col min-h-screen text-white p-6 md:p-8 lg:p-10">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-light_blue-500/10">
          <h1 className="text-2xl font-semibold text-light_blue-500">Company Files</h1>

          <div className="flex-grow max-w-xs sm:max-w-sm md:max-w-md order-last sm:order-none flex items-center gap-2">
            <Search />
          </div>


          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              className="dark bg-light_blue-500/10 hover:bg-light_blue-500/20 w-fit flex-shrink-0 flex items-center gap-1.5" // Added flex, items-center, gap
              onPress={() => setShowSharedFiles(prev => !prev)}
              title={showSharedFiles ? 'Hide shared files' : 'Show shared files'} // Updated title
            >
              {showSharedFiles ? (
                <>
                  <FaEyeSlash className="h-4 w-4" /> Hide Shared
                </>
              ) : (
                <>
                  <FaEye className="h-4 w-4" /> Show Shared
                </>
              )}
            </Button>
            <AddFolderButton />
            <AddFileButton />
          </div>
        </div>

        <div className="flex flex-col flex-grow overflow-hidden gap-6">
          <HeaderFolderPath />
          <div className="flex-grow rounded-lg overflow-y-auto custom-scrollbar">
            {/* Pass filtered files, folders, isLoading, and company_id as props */}
            <FileCardContainer files={displayFiles} folders={folders} isLoading={isLoading} company_id={company_id} />
          </div>
        </div>
      </div>
  );
};

export default FilesDashboard;
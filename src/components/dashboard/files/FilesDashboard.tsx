'use client';

import React from 'react';
import { Input } from "@heroui/react"; // Import Input from heroui
import { IoSearchOutline } from "react-icons/io5"; // Use IoSearchOutline icon
import { useFilesContext } from './hooks/useFilesContext';
import AddFileButton from './components/AddFileButton';
import AddFolderButton from './components/AddFolderButton';
import FileCardContainer from './components/FileCardContainer';

const FilesDashboard: React.FC = () => {
  const { searchTerm, setSearchTerm } = useFilesContext(); // Get state and setter from context

  return (
    <div className="flex flex-col min-h-screen bg-dark_blue text-white p-6 md:p-8 lg:p-10">
        {/* Header: Adjust layout for search bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-4 border-b border-light_blue-500/10">
          <h1 className="text-2xl font-semibold text-light_blue">Company Files</h1>

          {/* Use HeroUI Input component */}
          <div className="flex-grow max-w-xs sm:max-w-sm md:max-w-md order-last sm:order-none">
            <Input
              placeholder="Search files and folders..."
              size="sm"
              className="w-full dark text-white" // Apply styles from groupCardContainer
              value={searchTerm}
              onValueChange={setSearchTerm} // Use onValueChange
              endContent={<IoSearchOutline className="text-light_blue-500/70" />} // Use IoSearchOutline
              variant="bordered" // Apply variant
            />
          </div>

          <div className="flex items-center space-x-3">
            <AddFolderButton />
            <AddFileButton />
          </div>
        </div>

        <div className="flex flex-grow overflow-hidden space-x-6">
          <div className="flex-grow bg-dark_blue p-5 rounded-lg overflow-y-auto custom-scrollbar">
            <FileCardContainer />
          </div>

          {/* <div className="w-80 lg:w-96 flex-shrink-0 bg-modal_bg/60 p-5 rounded-lg overflow-y-auto hidden md:block custom-scrollbar">
            <h2 className="text-xl font-medium text-light_blue mb-5 pb-2 border-b border-light_blue-500/10">Details</h2>
            <FileDetailsContainer />
          </div> */}
        </div>
      </div>
  );
};

export default FilesDashboard;
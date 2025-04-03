'use client';

import React from 'react'; // Remove useState import
import { FaSearch } from 'react-icons/fa';
import { useFiles } from './hooks/useFiles'; // Import useFiles hook
import AddFileButton from './components/AddFileButton';
import AddFolderButton from './components/AddFolderButton';
import FileCardContainer from './components/FileCardContainer';

const FilesDashboard: React.FC = () => {
  const { searchTerm, setSearchTerm } = useFiles(); // Get state and setter from context

  return (
    <div className="flex flex-col min-h-screen bg-dark_blue text-white p-6 md:p-8 lg:p-10">
        {/* Header: Adjust layout for search bar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-4 border-b border-light_blue-500/10">
          <h1 className="text-2xl font-semibold text-light_blue">Company Files</h1>

          <div className="relative flex-grow max-w-xs sm:max-w-sm md:max-w-md order-last sm:order-none">
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md bg-modal_bg/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-light_blue-500/50 border border-transparent focus:border-light_blue-500/30"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
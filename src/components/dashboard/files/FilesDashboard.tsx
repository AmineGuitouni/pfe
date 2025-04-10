'use client';

import React from 'react';
import AddFileButton from './components/AddFileButton';
import AddFolderButton from './components/AddFolderButton';
import FileCardContainer from './components/FileCardContainer';
import Search from './components/search';
import HeaderFolderPath from './components/headerFolderPath';

const FilesDashboard: React.FC = () => {

  return (
    <div className="flex flex-col min-h-screen text-white p-6 md:p-8 lg:p-10">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-4 border-b border-light_blue-500/10">
          <h1 className="text-2xl font-semibold text-light_blue-500">Company Files</h1>

          <div className="flex-grow max-w-xs sm:max-w-sm md:max-w-md order-last sm:order-none">
            <Search />
          </div>

          <div className="flex items-center space-x-3">
            <AddFolderButton />
            <AddFileButton />
          </div>
        </div>

        <div className="flex flex-col flex-grow overflow-hidden gap-6">
          <HeaderFolderPath />
          <div className="flex-grow rounded-lg overflow-y-auto custom-scrollbar">
            <FileCardContainer />
          </div>
        </div>
      </div>
  );
};

export default FilesDashboard;
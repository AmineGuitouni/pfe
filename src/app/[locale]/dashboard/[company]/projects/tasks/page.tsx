import React from 'react';
import TaskList from '@/components/dashboard/projects/components/tasks/TaskList';

export default async function NewProjectPage ({params:{company}, searchParams:{projectName, projectDescription}}:{params:{company: string}, searchParams:{projectName: string, projectDescription: string}}) {

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1200px] py-6 px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28 ">
        <h1 className="text-2xl font-bold mb-4 text-white">New Project Tasks</h1>
        <p className="text-white/50 mb-4">
          This page allows you to create a new project and set up its tasks, including descriptions and dependencies.
        </p>
        <TaskList companyId={company} projectName={projectName} projectDescription={projectDescription} />
      </div>
    </div>
  );
};
import React from 'react';
import TaskList from '@/components/dashboard/projects/TaskList';

const NewProjectPage = () => {
  const borderColors = ['#a855f7', '#60a5fa', '#2dd4bf', '#facc15', '#f87171'];
  const tasks = [
    {
      id: 1,
      title: 'Research Competitor Strategies',
      description:
        "Analyze top 5 competitors' marketing approaches, messaging, and channel strategies.",
      dependencies: [],
      borderColor: borderColors[0],
    },
    {
      id: 2,
      title: 'Define Target Audience Segments',
      description:
        'Create detailed buyer profiles for each market segment including demographics, interests, and pain points.',
      dependencies: [],
      borderColor: borderColors[1],
    },
    {
      id: 3,
      title: 'Develop Campaign Messaging',
      description:
        'Create primary messaging, taglines, and value propositions based on market research and audience needs.',
      dependencies: ['Research Competitor Strategies', 'Define Target Audience Segments'],
      borderColor: borderColors[2],
    },
    {
      id: 4,
      title: 'Create Content Calendar',
      description:
        'Develop a detailed calendar outlining all campaign content, publication dates, and distribution channels.',
      dependencies: ['Develop Campaign Messaging'],
      borderColor: borderColors[3],
    },
    {
      id: 5,
      title: 'Design Campaign Assets',
      description:
        'Create visual assets including social media graphics, banner ads, and email templates following brand guidelines.',
      dependencies: ['Develop Campaign Messaging'],
      borderColor: borderColors[4],
    },
  ];

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1200px] py-6 px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28 ">
        <h1 className="text-2xl font-bold mb-4 text-white">New Project Tasks</h1>
        <p className="text-white/50 mb-4">
          This page allows you to create a new project and set up its tasks, including descriptions and dependencies.
        </p>
        <TaskList tasks={tasks} isLoading={true} />
      </div>
    </div>
  );
};

export default NewProjectPage;
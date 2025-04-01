import TaskItemSkeleton from '@/components/dashboard/projects/components/tasks/TaskItemSkeleton';

export default function Loading() {
  return (
    <div className="container mx-auto p-5 text-text-light font-poppins animate-pulse">
      {/* Header Skeleton */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-5 border-b border-light_blue-500/20">
        <div className="w-3/4 h-10 bg-gray-700 rounded mb-4 sm:mb-0"></div>
        <div className="flex items-center gap-5">
          <div className="w-24 h-8 bg-gray-700 rounded-full"></div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <div className="w-32 h-4 bg-gray-700 rounded"></div>
          </div>
        </div>
      </header>

      {/* Project Details Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Project Overview Card Skeleton */}
        <div className="lg:col-span-2 bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="w-1/3 h-8 bg-gray-700 rounded mb-4"></div>
          <div className="w-full h-4 bg-gray-700 rounded mb-2"></div>
          <div className="w-4/5 h-4 bg-gray-700 rounded mb-2"></div>
          <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
        </div>

        {/* Project Stats Card Skeleton */}
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="w-1/3 h-8 bg-gray-700 rounded mb-4"></div>
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-lg border-l-4 border-gray-700">
                <div className="w-1/2 h-4 bg-gray-700 rounded mb-1"></div>
                <div className="w-1/4 h-6 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks Section Skeleton */}
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
        <div className="w-1/4 h-8 bg-gray-700 rounded mb-5"></div>
        
        {/* Task Filters Skeleton */}
        <div className="flex flex-wrap gap-2 mb-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-20 h-10 bg-gray-700 rounded-md"></div>
          ))}
        </div>

        {/* Task List Skeleton */}
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <TaskItemSkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
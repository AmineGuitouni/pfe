"use client"
import { formatShortDate } from "@/lib/utils";
import { Alert, Avatar, cn, Link } from "@heroui/react";
import { 
  BuildingOffice2Icon, 
  CalendarDaysIcon,
  CircleStackIcon,
  InformationCircleIcon, // Re-added for About section
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import useCompanyOverview from "../hooks/useCompanyOverview";
import { useSession } from "next-auth/react";

// Removed DetailItem component

export default function CompanyOverview({ company_id }: { company_id: string }) {

  const { company, loading, error } = useCompanyOverview(company_id);
  const { data: session } = useSession();


 if((error || !company  ) && !loading) {
    return <div className=" w-full h-[100px] ">
              <Alert color="danger" title="Error Loading Company"  description={"Company data could not be found."} />;
           </div>
    
  }

  return (
    // Main container styled like section1.tsx
    <section className="w-full flex flex-col  gap-8">

      {/* Conditional Rendering: Skeleton or Actual Content */}
      {loading  && !company ? (
        // Skeleton Loading State
        <div className="flex flex-col md:flex-row w-full gap-8 md:gap-10 items-center md:items-start text-center md:text-left mb-8 p-6 rounded-xl border border-white/10 shadow-lg bg-white/5 backdrop-filter backdrop-blur-sm animate-pulse">
          {/* Left Side Skeleton */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-gray-700/50 rounded-full h-28 w-28 mb-4"></div>
            <div className="bg-gray-700/50 rounded h-10 w-3/4 mb-2"></div>
            <div className="bg-gray-700/50 rounded h-5 w-1/2"></div>
          </div>
          {/* Right Side Skeleton */}
          <div className="flex flex-col items-start justify-center w-full mt-6 md:mt-0">
            {/* About Skeleton */}
            <div className="w-full">
              <div className="bg-gray-700/50 rounded h-6 w-1/3 mb-3"></div>
              <div className="bg-gray-700/50 rounded h-4 w-full mb-2"></div>
              <div className="bg-gray-700/50 rounded h-4 w-full mb-2"></div>
              <div className="bg-gray-700/50 rounded h-4 w-full mb-6"></div>
            </div>
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Card 1 Skeleton */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="bg-gray-700/50 rounded h-5 w-1/2 mb-2"></div>
                <div className="bg-gray-700/50 rounded h-4 w-3/4"></div>
              </div>
              {/* Card 2 Skeleton */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="bg-gray-700/50 rounded h-5 w-1/2 mb-2"></div>
                <div className="bg-gray-700/50 rounded h-4 w-3/4"></div>
              </div>
              {/* Card 3 Skeleton */}
              <div className="flex flex-col gap-3 p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="bg-gray-700/50 rounded h-5 w-1/2 mb-2"></div>
                <div className="bg-gray-700/50 rounded h-4 w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Actual Content
        <div className="flex flex-col md:flex-row w-full gap-8 md:gap-10 items-center md:items-start text-center md:text-left mb-8 p-6 rounded-xl border border-white/10 shadow-lg bg-white/5 backdrop-filter backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center w-[25%]">
            <Avatar
              src={company?.logo || undefined}
              name={company?.name}
              size="lg" // Changed back from "xl" to "lg" to fix TS error
              className="flex-shrink-0 bg-gradient-to-br from-light_blue to-light_blue-500 text-dark_blue border-4 border-white/20 shadow-lg w-28 h-28 mb-4" // Kept adjusted size and margin via className
            />
            <div className={cn(" text-4xl font-bold text-center h-[50px] bg-gradient-to-r from-light_blue via-light_blue-500 to-white bg-clip-text text-transparent mb-2")}>
               {company?.name}
              </div>
            {company?.industry && (
              <p className="text-white/70 text-base sm:text-lg text-center md:text-left flex items-center justify-center md:justify-start gap-2">
                <BuildingOffice2Icon className="h-5 w-5 text-white/50" />
                {company.industry}
              </p>
            )}
          </div>
          <div className="flex flex-col items-start justify-center w-full mt-6 md:mt-0">
            {company?.description && (
            <div className="w-full">
              <h2 className="text-xl font-semibold text-light_blue-500 flex items-center gap-2 mb-3">
                <InformationCircleIcon className="h-6 w-6 " />
                About {company.name}
              </h2>
              <p className="text-base text-white/85 leading-relaxed text-start mb-6">
                {company.description}
              </p>
            </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="flex flex-col gap-3 p-4 rounded-lg border border-white/10 bg-white/5">
             <h2 className="text-lg font-semibold text-light_blue-500 flex items-center">
               <UserGroupIcon className="h-6 w-6  mr-2" />
               Workers
             </h2>
             <p className="text-white/90 text-base">{company && company.workers > 0 ? company.workers > 1 ? `${company.workers} workers` : `${company.workers} worker` : "No workers"}</p>
           </div>

           {/* Created On Card - Adjusted min-height and gap */}
           <div className="flex flex-col gap-3 p-4 rounded-lg border border-white/10 bg-white/5">
             <h2 className="text-lg font-semibold text-light_blue-500 flex items-center">
              <CalendarDaysIcon fontSize={20} className=" h-6 w-6  mr-2" />
              Created On
             </h2>
             <p className="text-white/90 text-base">{company?.created_at ? formatShortDate(company?.created_at) : ""}</p>
           </div>

           {/* Database Card - Adjusted min-height and gap */}
           <div className="flex flex-col gap-3 p-4 rounded-lg border border-white/10 bg-white/5">
             {/*  */}
             <h2 className="text-lg font-semibold text-light_blue-500 flex items-center">
             <CircleStackIcon fontSize={20} className=" h-6 w-6  mr-2" />
              Database
             </h2>
             <div className="text-white/90 text-base">
               {company?.database ? (
                 <Link target="_blank" href={session?.user?.role === "admin" ? "/dashboard/account/databases" : "#"} size="sm" className="text-light_blue hover:underline font-medium flex items-center text-base gap-2">
                   <span>{company.database.name}</span>
                   <span className="text-xs text-white/60 mt-1">Created: {formatShortDate(company.database.created_at)}</span>
                 </Link>
               ) : (
                 "Shared Database (free)"
               )}
             </div>
           </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
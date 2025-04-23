"use client"
import { formatShortDate } from "@/lib/utils";
import { Alert, Avatar, Link, Spinner } from "@heroui/react";
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

  if (loading  && !company) {
    return (
      <div className=" w-full h-full flex items-center justify-center">
        <Spinner color="white" size="lg" />
      </div>
    );
  }

  if (error || !company) {
    return <Alert color="danger" title="Error Loading Company" description={error || "Company data could not be found."} />;
  }

  return (
    // Main container styled like section1.tsx
    <section className="w-full h-full flex flex-col justify-start items-center max-w-[1920px] sm:px-[20px] lg:px-[100px] sm:gap-5 gap-8 p-8 md:p-10">

      {/* Header Section styled like section1.tsx */}
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <Avatar
          src={company.logo || undefined}
          name={company.name}
          size="lg" // Changed back from "xl" to "lg" to fix TS error
          className="flex-shrink-0 bg-gradient-to-br from-light_blue to-light_blue-500 text-dark_blue border-4 border-white/20 shadow-lg w-28 h-28 mb-4" // Kept adjusted size and margin via className
        />
        <div className="text-4xl sm:text-6xl font-semibold h-[45px] sm:h-[70px] text-center bg-gradient-to-r from-light_blue via-light_blue-500 to-white bg-clip-text text-transparent">
            {company.name}
          </div>
        {company.industry && (
          <p className="text-white/70 sm:text-lg text-medium w-[70%] sm:w-[50%] text-center flex items-center justify-center gap-2">
            <BuildingOffice2Icon className="h-5 w-5 text-white/50" />
            {company.industry}
          </p>
        )}
      </div>

      {/* About Section Re-added and Styled */}
      {company.description && (
        <div className="w-full  bg-white/5 p-6 rounded-lg border border-white/10 shadow-md mt-6 mb-10">
          <h2 className="text-xl font-semibold text-light_blue-500 flex items-center gap-2.5 mb-4">
            <InformationCircleIcon className="h-6 w-6 " />
            About {company.name}
          </h2>
          <p className="text-base text-white/85 leading-relaxed">
            {company.description}
          </p>
        </div>
      )}

      {/* Details Section styled like homeCards.tsx - Adjusted container */}
      <div className="w-full flex flex-col lg:flex-row justify-center items-start gap-5 z-10 p-2 md:p-0"> 
         <div className="bg-white/5 hover:scale-105 min-h-[160px] transition-all ease-linear border-white/10 border-1 rounded-lg p-6 w-full lg:w-1/3 flex flex-col gap-4 shadow-sm"> 
           <h2 className="text-xl font-semibold text-light_blue-500 flex items-center">
             <UserGroupIcon className="h-6 w-6  mr-2" />
             Workers
           </h2>
           <p className="text-white/90 text-lg">{company.workers > 0 ? company.workers > 1 ? `${company.workers} workers` : `${company.workers} worker` : "No workers"}</p>
         </div>

         {/* Created On Card - Adjusted min-height and gap */}
         <div className="bg-white/5 hover:scale-105 min-h-[160px] transition-all ease-linear border-white/10 border-1 rounded-lg p-6 w-full lg:w-1/3 flex flex-col gap-4 shadow-sm"> 
           <h2 className="text-xl font-semibold mr-2 text-light_blue-500 flex items-center">
            <CalendarDaysIcon fontSize={20} className=" h-6 w-6  mr-2" />
            Created On
           </h2>
           <p className="text-white/90 text-base">{formatShortDate(company.created_at)}</p>
         </div>

         {/* Database Card - Adjusted min-height and gap */}
         <div className="bg-white/5 hover:scale-105 min-h-[160px] transition-all ease-linear border-white/10 border-1 rounded-lg p-6 w-full lg:w-1/3 flex flex-col gap-4 shadow-sm"> {/* Increased padding, gap, rounded-lg */}
           {/*  */}
           <h2 className="text-xl font-semibold text-light_blue-500 flex items-center">
           <CircleStackIcon fontSize={20} className=" h-6 w-6  mr-2" />
            Database
           </h2>
           <div className="text-white/90 text-base">
             {company.database ? (
               <Link target="_blank" href={session?.user?.role === "admin" ? "/dashboard/account/databases" : "#"} size="sm" className="text-light_blue hover:underline font-medium flex items-center text-lg gap-2">
                 <span>{company.database.name}</span>
                 <span className="text-xs text-white/60 mt-1">Created: {formatShortDate(company.database.created_at)}</span>
               </Link>
             ) : (
               "Shared Database (free)"
             )}
           </div>
         </div>
      </div>

    </section>
  );
}
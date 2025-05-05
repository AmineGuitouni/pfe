"use client";

import CommandCenterContainer from "@/components/dashboard/command-center/component/CommandCenterContainer";
import HistorySidebar from "@/components/dashboard/command-center/component/HistorySidebar";
import { CommandCenterProvider } from "@/components/dashboard/command-center/context/CommandCenterContext";

export default function CommandCenterPage({ params: { company } }: { params: { company: string } }) {
    // TODO: Potentially use the 'company' param later
    return (
        // Wrap the entire page content with the context provider
        <CommandCenterProvider>
            {/* Use flex-row to position sidebar and container side-by-side */}
            {/* Adjust height/padding as needed for overall dashboard layout */}
            {/* Use flex-row to position container and sidebar side-by-side */}
            {/* Adjust height/padding as needed for overall dashboard layout */}
            <div className="flex flex-row w-full h-full gap-4 p-4 sm:p-6 lg:p-10">
                {/* Main container takes remaining space */}
                <div className="flex-1 h-full"> {/* Ensure container takes full height */}
                     <CommandCenterContainer />
                </div>
                {/* Sidebar is now on the right */}
                <HistorySidebar />
            </div>
        </CommandCenterProvider>
    );
}
import React from 'react';
import { FaBuilding, FaUsers } from 'react-icons/fa'; // Example icons

export default function WhoIsItFor() {
    return (
        <section className="w-full flex flex-col items-center max-w-[1920px] sm:px-[20px] lg:px-[100px] gap-10 mb-28 z-10">
            <h2 className="text-4xl sm:text-5xl font-semibold text-center bg-gradient-to-r from-light_blue via-light_blue-500 to-white bg-clip-text text-transparent mb-8">
                Who Is It For?
            </h2>
            <p className="text-white/70 sm:text-lg text-medium w-[70%] sm:w-[60%] text-center mb-12">
                Our platform operates on a Software as a Service (SaaS) model, designed to cater specifically to the needs of modern businesses and their teams.
            </p>
            <div className="w-full flex flex-col lg:flex-row justify-center items-stretch gap-8">
                {/* Company Owner Card */}
                <div className="bg-white/10 border-white/20 border-1 rounded-md p-6 w-full lg:w-1/2 flex flex-col gap-4 items-center text-center">
                    <FaBuilding className="text-4xl text-light_blue-500 mb-3" />
                    <h3 className="text-2xl font-semibold text-white">Company Owners</h3>
                    <p className="text-white/70">
                        Businesses subscribing to manage their operations, employees, projects, and resources efficiently. Get a comprehensive suite of tools to oversee your entire company structure, track progress, and leverage AI for smarter management.
                    </p>
                </div>

                {/* Employee Card */}
                <div className="bg-white/10 border-white/20 border-1 rounded-md p-6 w-full lg:w-1/2 flex flex-col gap-4 items-center text-center">
                    <FaUsers className="text-4xl text-light_blue-500 mb-3" />
                    <h3 className="text-2xl font-semibold text-white">Employees</h3>
                    <p className="text-white/70">
                        Team members invited by their company owners. Use the platform to manage your profile, submit CVs for skill analysis, track assigned tasks, access project resources, and collaborate effectively within your company&amp;apos;s workspace.
                    </p>
                </div>
            </div>
        </section>
    );
}
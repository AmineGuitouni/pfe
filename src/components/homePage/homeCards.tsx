import { RiRobot2Line } from "react-icons/ri";
import { MdKeyboardCommandKey } from "react-icons/md";
import { ImStatsDots } from "react-icons/im";
import { FaFolderOpen, FaUserCog, FaTasks } from "react-icons/fa"; // Import new icons

export default function HomeCards() {
    return (
        <section id="features" className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 z-10 p-2 md:p-0"> {/* Use grid layout */}
            <div className="bg-white/10 hover:scale-105 min-h-[200px] transition-all ease-linear border-white/20 border-1 rounded-md p-5 w-full h-full flex flex-col gap-5"> {/* Remove lg:w-1/3 */}
                <RiRobot2Line className="text-3xl text-light_blue-500" />
                <h1 className="text-2xl font-semibold text-white">AI Task Management</h1>
                <p className="text-white/70">Smart task generation and assignment based on CV analysis and skill tracking.</p>
                
            </div>

            <div className="bg-white/10 border-white/20 min-h-[200px] hover:scale-105 transition-all ease-linear border-1 rounded-md p-5 w-full h-full flex flex-col gap-5"> {/* Remove lg:w-1/3 */}
                <MdKeyboardCommandKey className="text-3xl text-light_blue-500" />
                <h1 className="text-2xl font-semibold text-white">Command Center</h1>
                <p className="text-white/70">Lightning-fast CLI interface for seamless workflow execution and team coordination.</p>
                
            </div>

            <div className="bg-white/10 border-white/20 min-h-[200px] hover:scale-105 transition-all ease-linear border-1 rounded-md p-5 w-full h-full flex flex-col gap-5"> {/* Remove lg:w-1/3 */}
                <ImStatsDots className="text-3xl text-light_blue-500" />
                <h1 className="text-2xl font-semibold text-white">Smart Analytics</h1>
                <p className="text-white/70">Real-time insights with AI-powered performance optimization suggestions.</p>
                
            </div>

            {/* New Card: Resource Hub */}
            <div className="bg-white/10 border-white/20 min-h-[200px] hover:scale-105 transition-all ease-linear border-1 rounded-md p-5 w-full h-full flex flex-col gap-5"> {/* Remove lg:w-1/3 */}
                <FaFolderOpen className="text-3xl text-light_blue-500" />
                <h1 className="text-2xl font-semibold text-white">Resource Hub</h1>
                <p className="text-white/70">Access all company documents instantly with smart, AI-powered search.</p>
            </div>

            {/* New Card: Streamlined HR */}
            <div className="bg-white/10 border-white/20 min-h-[200px] hover:scale-105 transition-all ease-linear border-1 rounded-md p-5 w-full h-full flex flex-col gap-5"> {/* Remove lg:w-1/3 */}
                <FaUserCog className="text-3xl text-light_blue-500" />
                <h1 className="text-2xl font-semibold text-white">Streamlined HR</h1>
                <p className="text-white/70">Simplify HR processes with automated CV analysis and skill tracking.</p>
            </div>

            {/* New Card: Project Visibility */}
            <div className="bg-white/10 border-white/20 min-h-[200px] hover:scale-105 transition-all ease-linear border-1 rounded-md p-5 w-full h-full flex flex-col gap-5"> {/* Remove lg:w-1/3 */}
                <FaTasks className="text-3xl text-light_blue-500" />
                <h1 className="text-2xl font-semibold text-white">Project Visibility</h1>
                <p className="text-white/70">Gain clear insights into project progress and team productivity with dynamic dashboards.</p>
            </div>

        </section>
    )
}
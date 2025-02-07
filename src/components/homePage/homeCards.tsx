import { RiRobot2Line } from "react-icons/ri";
import { MdKeyboardCommandKey } from "react-icons/md";
import { ImStatsDots } from "react-icons/im";
export default function HomeCards() {
    return (
        <section className="w-full flex flex-col lg:flex-row justify-center items-center gap-5 z-10 p-2 md:p-0">
            <div className="bg-white/10 hover:scale-105 min-h-[200px] transition-all ease-linear border-white/20 border-1 rounded-md p-5 w-full lg:w-1/3 h-full flex flex-col gap-5">
                <RiRobot2Line className="text-3xl text-light_blue-500" />
                <h1 className="text-2xl font-semibold text-white">AI Task Management</h1>
                <p className="text-white/70">Smart task generation and assignment based on CV analysis and skill tracking.</p>
                
            </div>

            <div className="bg-white/10 border-white/20 min-h-[200px] hover:scale-105 transition-all ease-linear border-1 rounded-md p-5 w-full lg:w-1/3 h-full flex flex-col gap-5">
                <MdKeyboardCommandKey className="text-3xl text-light_blue-500" />
                <h1 className="text-2xl font-semibold text-white">Command Center</h1>
                <p className="text-white/70">Lightning-fast CLI interface for seamless workflow execution and team coordination.</p>
                
            </div>

            <div className="bg-white/10 border-white/20 min-h-[200px] hover:scale-105 transition-all ease-linear border-1 rounded-md p-5 w-full lg:w-1/3 h-full flex flex-col gap-5">
                <ImStatsDots className="text-3xl text-light_blue-500" />
                <h1 className="text-2xl font-semibold text-white">Smart Analytics</h1>
                <p className="text-white/70">Real-time insights with AI-powered performance optimization suggestions.</p>
                
            </div>


        </section>
    )
}
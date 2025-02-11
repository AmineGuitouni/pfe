import { IoIosArrowForward } from "react-icons/io";
import { RiNotification4Fill } from "react-icons/ri";
export default function CompanyCard({name,id}:{name:string,id:string}) {
    return (
        <div className="w-[400px] h-[200px] border-1 cursor-pointer group hover:scale-[101%] border-white/20 p-5 bg-white/5 hover:bg-white/10 transition-all ease-linear rounded-lg flex flex-col justify-between ">
            <div className="w-full flex items-start justify-between">
                <div className="flex flex-col">
                    <h1 className="text-white text-md font-[400]">{name}</h1>
                    <h1 className="text-white/50 text-sm">20 workers</h1>
                </div>
                <IoIosArrowForward size={22} className="text-white/50 group-hover:text-light_blue-500 group-hover:translate-x-1 transition-all ease-linear"/>
            </div>
            <RiNotification4Fill size={20} className="text-white/50"/>



        </div>
    )
}
import { formatShortDate } from "@/lib/utils";
import { IoIosArrowForward } from "react-icons/io";

export default function CompanyCard({name,id,createdAt}:{name:string,id:string,createdAt:string}) {
    console.log(id)
    return (
        <div className="w-96 h-48 border-1 cursor-pointer group hover:scale-[101%] border-white/20 p-5 bg-white/5 hover:bg-white/10 transition-all ease-linear rounded-lg flex flex-col justify-between ">
            <div className="w-full flex items-start justify-between">
                <div className="flex flex-col">
                    <h1 className="text-light_blue text-md font-[400]">{name}</h1>
                    <h1 className="text-white/50 text-sm">20 workers</h1>
                </div>
                <IoIosArrowForward size={22} className="text-white/50 group-hover:text-light_blue-500 group-hover:translate-x-1 transition-all ease-linear"/>
            </div>
            
            <h1 className="text-white/50 text-sm">Created on {formatShortDate(createdAt)}</h1>



        </div>
    )
}
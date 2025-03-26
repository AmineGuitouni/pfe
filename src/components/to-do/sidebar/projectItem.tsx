import { Link } from "@heroui/react"
import NextLink from "next/link"
import { GoProject } from "react-icons/go";

export default function ProjectItem() {
    return (
        <div className="w-full h-[50px] flex   pl-5 hover:bg-white/10 group cursor-pointer duration-200 ease-in-out ">
            <Link as={NextLink} href="#" className="text-white text-medium line-clamp-1 group-hover:text-light_blue-500 transition-all ease-linear flex gap-2 ">
                <GoProject className="text-light_blue group-hover:text-light_blue-500" size={20} />
                project name
            </Link>
        </div>
    )
}
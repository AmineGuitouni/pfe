import Link from "next/link";
import {menuItems} from "../../navbar"
import {categories} from "@/utils/categories"
import { IoIosArrowDown } from "react-icons/io";
import * as Icons from "lucide-react";
import { Accordion, AccordionItem } from "@heroui/react";




export default function MenuToolTip() {

    return (
        <div className="relative gap-2 flex flex-col flex-shrink-0  ">

            {
                menuItems.map((item,index)=>{
                        return (
                            <Link key={`${item}-${index}`} href={item.href}  className=" text-xl text-forground hover:text-logo_color transition-all ease-out duration-200 " >
                            {item.name}
                            </Link>
                        )
            })
            }

            <p className="w-fit text-xl mb-1  text-forground flex items-center gap-2  ">
                Categories
                <IoIosArrowDown size={18} className="mt-2"/>
            </p>

            <Accordion className="flex flex-col gap-1" showDivider={false} itemClasses={
                {base: "py-0 ",
                title: "font-normal text-lg ",
                trigger: "px-2 py-0  rounded-lg  flex items-center",
                indicator: "text-medium text-foreground",
                content: "text-md pl-2",}
            }>
                {
                    categories.map((item,index)=>{
                        const IconComponent = Icons[item.icon as keyof typeof Icons] as any;
                        return (
                            
                                <AccordionItem startContent={<IconComponent size={20}/>}  key={index} aria-label={item.category} title={item.category} >

                                    <div className="flex flex-col">
                                    {
                                        item.subCategory.map((i,n)=>{
                    
                                         return(
                                            <Link key={`${i}-${n}`} href={"#"}  className="ml-8 w-fit text-medium text-forground hover:text-logo_color transition-all ease-out duration-200 " >
                                            {i}
                                            </Link>
                                         )

                                        })
                                    }
                                    </div>
                                    
                                </AccordionItem>
                           
                        )
                    })
                }
            </Accordion>

        </div>
    )
}
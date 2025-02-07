"use client"
import { Cross as Hamburger } from 'hamburger-react'
import { useState } from 'react'
import {motion} from "framer-motion"
import Link from 'next/link'
import { menuItems } from '../../navbar'



export default function Humburger() {

    const [isOpen, setOpen] = useState(false)
    const onToggle = () => setOpen(!isOpen)

    

    return ( 
        <div className='md:hidden z-10 mr-2 '>
            <Hamburger color="white" direction='right' size={25} easing='ease-out' duration={0.2} rounded={true} toggled={isOpen} toggle={setOpen} onToggle={onToggle} />
            <motion.div 
            variants={{hidden:{opacity:0 , x:"100%"},visible:{opacity:1 , x:0 }}} 
            transition={{duration:0.2 , ease:"easeOut"}}  
            animate={isOpen ? "visible" : "hidden"} 
            initial="hidden" 
            className="absolute top-[60px] left-[-50px] w-[calc(100%+90px)]  h-[100vh] rounded-lg bg-dark_blue z-10 text-xs pl-[85px] py-[45px] overflow-y-hidden flex flex-col gap-6 ">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className="text-xl text-white hover:text-logo_color transition-all ease-linear "
                    >
                        {item.name}
                    </Link>
                ))}
            </motion.div>
        </div>
    )
}
"use client"
import { Cross as Hamburger } from 'hamburger-react'
import { useState } from 'react'
import {motion} from "framer-motion"
import MenuToolTip from './menuToolTip';



export default function Humburger() {

    const [isOpen, setOpen] = useState(false)
    const onToggle = () => setOpen(!isOpen)

    

    return ( 
        <div className='md:hidden z-10 mr-2'>
            <Hamburger color="#d95807" direction='right' size={25} easing='ease-out' duration={0.2} rounded={true} toggled={isOpen} toggle={setOpen} onToggle={onToggle} />
            <motion.div 
            variants={{hidden:{opacity:0 , x:"100%"},visible:{opacity:1 , x:0 }}} 
            transition={{duration:0.2 , ease:"easeOut"}}  
            animate={isOpen ? "visible" : "hidden"} 
            initial="hidden" 
            className="absolute top-[100px] left-0 w-full h-fit min-h-[calc(100dvh-100px)] bg-[#d9d9db] z-10 text-xs pl-[85px] py-[45px] overflow-y-hidden ">
                <MenuToolTip/>
            </motion.div>
        </div>
    )
}
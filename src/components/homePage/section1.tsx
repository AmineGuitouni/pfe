import { Button } from "@heroui/react";
import { RiRobot2Fill } from "react-icons/ri";
import HomeCards from "./homeCards";
import Link from "next/link";

export default function Section1() { 
    return(
        <section className="w-full h-[100sh]  flex flex-col justify-center items-center  max-w-[1920px] sm:px-[20px] lg:px-[100px] sm:gap-10 gap-5 mb-28">

        <div className="border-white/20 z-10 hover:animate-pulse border-1 rounded-full px-5 py-1 bg-white/10 flex items-center gap-2">
          <RiRobot2Fill className="text-light_blue-500"/>
          <p className="text-white text-sm">AI-Powered</p>
        </div>

        <div className="flex flex-col gap-2 ">
          <h1 className="text-white text-4xl sm:text-6xl   text-center ">Revolutionize your</h1>
          <div className="text-4xl sm:text-6xl font-semibold h-[45px] sm:h-[70px] text-center bg-gradient-to-r from-light_blue via-light_blue-500 to-white bg-clip-text text-transparent">
            Workplace
          </div>
        </div>

        <p className="text-white/70 sm:text-lg text-medium w-[70%] sm:w-[50%] text-center">Experience the future of company management with our revolutionary AI-driven platform. Streamline operations, enhance HR processes, centralize resources, and adapt to your team&amp;apos;s unique dynamics.</p>

        <div className="flex gap-5 items-center mb-5">
          <Button as={Link} href="/login?role=admin" className="bg-light_blue-500 text-dark_blue py-4 px-8 rounded-xl text-medium sm:text-xl font-semibold">Get Started</Button>
          <a href="#features" className="border-light_blue-500/70 text-light_blue-500 py-4 px-8 rounded-xl text-medium sm:text-xl font-semibold border-1 hover:bg-light_blue-500/10 transition-colors">See Features</a>
        </div>

        <HomeCards/>

      </section>
    )
}
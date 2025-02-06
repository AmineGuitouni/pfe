import { Button } from "@heroui/react";
import { RiRobot2Fill } from "react-icons/ri";
import HomeCards from "./homeCards";

export default function Section1() { 
    return(
        <section className="w-full h-[100sh]  flex flex-col justify-center items-center  max-w-[1920px] sm:px-[20px] lg:px-[100px] sm:gap-10 gap-5 mb-28">

        <div className="border-white/20 z-10 hover:animate-pulse border-1 rounded-full px-5 py-1 bg-white/10 flex items-center gap-2">
          <RiRobot2Fill className="text-light_blue-500"/>
          <p className="text-white text-sm">AI-Powered</p>
        </div>

        <div className="flex flex-col gap-2 ">
          <h1 className="text-white text-4xl sm:text-6xl   text-center ">Revolutionize your</h1>
          <div className="text-4xl sm:text-6xl font-semibold h-[70px] text-center bg-gradient-to-r from-light_blue via-light_blue-500 to-white bg-clip-text text-transparent">
            Workplace
          </div>
        </div>

        <p className="text-white/70 sm:text-lg text-medium w-[40%] text-center">Experience the future of work with our revolutionary AI-driven platform that adapts to your team`s unique dynamics.</p>

        <div className="flex gap-5 items-center mb-5">
          <Button size="lg" className="bg-light_blue-500 text-dark_blue py-4 px-8 rounded-xl text-xl font-semibold">Get Started</Button>
          <Button size="lg" variant="bordered" className="border-light_blue-500/70 text-light_blue-500 py-4 px-8 rounded-xl text-xl font-semibold">See more</Button>
        </div>

        <HomeCards/>

      </section>
    )
}
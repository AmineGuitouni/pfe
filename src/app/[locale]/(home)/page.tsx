import Section1 from "@/features/homePage/section1";
import Section2 from "@/features/homePage/section2";
import WhoIsItFor from "@/features/homePage/whoIsItFor"; // Import the new component

export default async function Home() {
  return (
    <div className='h-full flex flex-col items-center '>
      <div className="w-[800px] h-[800px]  fixed -translate-y-[100px] blur-3xl bg-light_blue-500/10 rounded-full"></div>
      <Section1/>
      <Section2/>
      <WhoIsItFor/> {/* Add the new component */}
    </div>
  );
}
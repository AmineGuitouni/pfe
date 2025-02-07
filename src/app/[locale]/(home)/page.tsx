import Section1 from "@/components/homePage/section1";
import Section2 from "@/components/homePage/section2";

export default async function Home() {

  return (
    <div className='h-full flex flex-col items-center '>
      <div className="w-[800px] h-[800px]  fixed -translate-y-[100px] blur-3xl bg-light_blue-500/10 rounded-full"></div>
      <Section1/>
      <Section2/>
    </div>
  );
}
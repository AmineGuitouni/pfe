import Header from "@/features/dashboard/header";
import CompanyProvider from "@/features/dashboard/companies/contexts/useCompanies";
import SideBar from "@/features/dashboard/sidebar/sideBar";
import SideBarProvider from "@/features/dashboard/sidebar/contexts/sideBarContext";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const session = await getServerSession(authOptions)

    return (
    <div className='relative w-full min-h-screen mx-auto flex'>
      <SideBarProvider>
      <SideBar/>
      <div className="flex-grow flex flex-col overflow-y-auto w-full">
        <div className="w-[700px] h-[700px] fixed left-[40%] translate-y-[20%] blur-3xl bg-light_blue-500/5 rounded-full"></div>
        <Header session={session}/>
        <CompanyProvider>
          {children}
        </CompanyProvider>
      </div>
      </SideBarProvider>
    </div>
  );
}

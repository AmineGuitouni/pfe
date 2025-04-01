import Header from "@/components/dashboard/header";
import CompanyProvider from "@/components/dashboard/companies/contexts/useCompanies";
import SideBar from "@/components/dashboard/sidebar/sideBar";
import SideBarProvider from "@/components/dashboard/sidebar/contexts/sideBarContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    return (
    <div className='relative w-full min-h-screen mx-auto flex'>
      <SideBarProvider>
      <SideBar/>
      <div className="flex-grow flex flex-col overflow-y-auto w-full">
        <div className="w-[700px] h-[700px] fixed left-[40%] translate-y-[20%] blur-3xl bg-light_blue-500/5 rounded-full"></div>
        <Header/>
        <CompanyProvider>
          {children}
        </CompanyProvider>
      </div>
      </SideBarProvider>
    </div>
  );
}

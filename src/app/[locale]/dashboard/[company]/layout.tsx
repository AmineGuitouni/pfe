import Header from "@/components/dashboard/header";
import CompanyProvider from "@/components/dashboard/companies/contexts/useCompanies";
import SideBarProvider from "@/components/dashboard/sidebar/contexts/sideBarContext";
import CompanySideBar from "@/components/dashboard/sidebar/companySideBar";

export default async function CompanyLayout({
  children,
  params : {company}
}: Readonly<{
  children: React.ReactNode;
  params: {company: string};
}>) {

    return (
    <div className='relative w-full min-h-screen mx-auto flex'>
      <SideBarProvider>
      <CompanySideBar companyId={company}/>
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

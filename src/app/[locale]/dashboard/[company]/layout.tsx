import Header from "@/components/dashboard/header";
import SideBarProvider from "@/components/dashboard/sidebar/contexts/sideBarContext";
import CompanySideBar from "@/components/dashboard/sidebar/companySideBar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import CompanyProvider from "@/providers/companyIdProvider";

export default async function CompanyLayout({
  children,
  params : {company}
}: Readonly<{
  children: React.ReactNode;
  params: {company: string};
}>) {

    const session = await getServerSession(authOptions);

    return (
      <main
      className='bg-dark_blue relative flex w-full max-w-full overflow-hidden'
    >
      <CompanyProvider company_id={company}>
      <SideBarProvider>
      <CompanySideBar companyId={company} session={session}/>
      <div className="flex flex-col w-full min-w-0">
        <div className="w-[700px] h-[700px] fixed left-[40%] translate-y-[20%] blur-3xl bg-light_blue-500/5 rounded-full"></div>
        <Header session={session}/>
        <div className="w-full min-h-[calc(100vh-64px)] relative overflow-hidden">
            {children}
        </div>
      </div>
      </SideBarProvider>
      </CompanyProvider>
    </main>
  );
}

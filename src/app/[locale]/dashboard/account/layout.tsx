import Header from "@/components/dashboard/header";
import CompanyProvider from "@/components/dashboard/companies/useCompanies";
import SideBar from "@/components/dashboard/sideBar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    return (
      <main
        className='w-screen h-screen mx-auto flex '
      >
          <SideBar/>
          <div className="flex-grow flex flex-col ">
            <div className="w-[700px] h-[700px]  fixed left-[40%] translate-y-[20%]  blur-3xl bg-light_blue-500/5 rounded-full"></div>
              <Header/>
              <CompanyProvider>
                {children}
              </CompanyProvider>
          </div>
      </main>
    );
}

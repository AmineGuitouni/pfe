import Header from "@/components/dashboard/header";
import SideBar from "@/components/dashboard/sideBar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    return (
                <main
                  className='max-w-[1920px] h-screen max-h-[1000px] mx-auto flex '
                >
                    <SideBar/>
                    <div className="flex-grow flex flex-col gap-10">
                        <Header/>
                        {children}
                    </div>
                </main>
    );
}

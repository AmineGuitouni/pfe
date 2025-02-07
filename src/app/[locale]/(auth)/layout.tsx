import Footer from "@/components/footer";
import Link from "next/link";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    return (
                <main
                  className='max-w-[1920px] min-h-screen mx-auto flex flex-col items-center justify-between'
                >
                    <div className=" w-full h-full  bg-dark_grey flex justify-center items-center ">
                        <div className="w-[40vw] h-[40vw] max-w-[800px] max-h-[800px]  fixed left-1/2  -translate-x-1/2  blur-3xl  bg-light_blue-500/10 rounded-full"></div>
                        <div className="w-full h-full flex flex-col gap-8 ">
                            <Link href={"/"} className="text-2xl text-white font-semibold z-10 w-full text-center sm:text-start sm:ml-14 sm:mt-14 mt-8">Digi Growing</Link>
                            <div className="w-full flex-grow">
                              {children}
                            </div>
                        </div>
                    </div>
                    <Footer/>
                </main>
    );
}

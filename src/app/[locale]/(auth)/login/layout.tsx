import Footer from "@/components/footer";
import Background from "@/components/homePage/background";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    return (
                <main
                  className='max-w-[1920px] h-screen max-h-[900px] mx-auto flex flex-col items-center justify-between'
                >
                    <Background/>
                    {children}
                    <Footer/>
                </main>
    );
}

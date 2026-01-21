
import Nav from "@/features/navbar/navbar";
import Footer from "@/components/footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import Background from "@/features/homePage/background";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

    return (

                <main
                  className='bg-dark_blue relative flex flex-col justify-center items-center w-full max-w-full'
                >
                <Background/>
                <Nav session={session}/>
                {children}
                <Footer/>
                </main>

    );
}


import Nav from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import Background from "@/components/homePage/background";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  console.log(session)

    return (

                <main
                  className='bg-dark_blue flex flex-col justify-center items-center overflow-x-hidden'
                >
                <Background/>
                <Nav session={session}/>
                {children}
                <Footer/>
                </main>

    );
}

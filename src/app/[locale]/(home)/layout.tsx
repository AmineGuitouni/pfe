import TranslationsProvider from "@/providers/translationProvider";
import initTranslations from '../../i18n';
import Nav from "@/components/navbar/navbar";
import Footer from "@/components/footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

const i18nNamespaces = ['page'];

export default async function RootLayout({
  children,
  params : {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string}
}>) {
  const session = await getServerSession(authOptions);

    const { resources } = await initTranslations(locale, i18nNamespaces);
    return (

            <TranslationsProvider
                namespaces={i18nNamespaces}
                locale={locale}
                resources={resources}>
                <main
                  className='bg-dark_blue flex flex-col justify-center items-center overflow-x-hidden'
                >
                <Nav session={session}/>
                {children}
                <Footer/>
                </main>
            </TranslationsProvider>

    );
}

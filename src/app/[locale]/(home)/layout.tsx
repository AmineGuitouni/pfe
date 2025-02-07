import TranslationsProvider from "@/providers/translationProvider";
import initTranslations from '../../i18n';
import Nav from "@/components/navbar/navbar";
import Footer from "@/components/footer";

const i18nNamespaces = ['page'];

export default async function RootLayout({
  children,
  params : {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string}
}>) {

    const { resources } = await initTranslations(locale, i18nNamespaces);
    return (

            <TranslationsProvider
                namespaces={i18nNamespaces}
                locale={locale}
                resources={resources}>
                <main
                  className='bg-dark_blue flex flex-col justify-center items-center overflow-x-hidden'
                >
                <Nav/>
                {children}
                <Footer/>
                </main>
            </TranslationsProvider>

    );
}

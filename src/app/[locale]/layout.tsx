import TranslationsProvider from "@/providers/translationProvider";
import initTranslations from '../i18n';

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
                <div 
                    // className='max-w-[1920px] mx-auto sm:px-[20px] lg:px-[100px]  '
                >
                {children}
                </div>
            </TranslationsProvider>

    );
}

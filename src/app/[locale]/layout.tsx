import { NextIntlClientProvider } from "next-intl";
import { getMessages } from 'next-intl/server';
import DirectionProvider from "@/components/DirectionProvider";

export async function generateStaticParams() {
  const languages = ["en", "fr", "ar"];
 
  return languages.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DirectionProvider>
        {children}
      </DirectionProvider>
    </NextIntlClientProvider>
  );
}

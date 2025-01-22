import initTranslations from '../i18n';
import ExampleClientComponent from '@/components/clientComponent';
import LanguageChanger from '@/components/languageChanger';
import TranslationsProvider from '@/providers/translationProvider';

const i18nNamespaces = ['page'];

export default async function Home({ params: { locale } } : {params: {locale: string}}) {
  const { t, resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <TranslationsProvider
      namespaces={i18nNamespaces}
      locale={locale}
      resources={resources}>
      <main>
        <h1>{t('header')}</h1>
        <ExampleClientComponent />
        <LanguageChanger />
      </main>
    </TranslationsProvider>
  );
}
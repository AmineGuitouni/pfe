import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import i18nConfig from '../../i18config';

export default async function initTranslations(
  locale: any,
  namespaces: any[],
  i18nInstance?: { use: (arg0: any) => void; 
  init: (arg0: { lng: any; resources: any; fallbackLng: string; supportedLngs: string[]; defaultNS: any; fallbackNS: any; ns: any; preload: string[]; }) => any; 
  services?: { resourceStore: { data: any; }; }; t: any; },
  resources?: any
) {
  i18nInstance = i18nInstance || createInstance();

  i18nInstance.use(initReactI18next);

  if (!resources) {

    i18nInstance.use(
      resourcesToBackend(
        (language: any, namespace: any) =>
          import(`@/locales/${language}/${namespace}.json`)
      )
    );
  }

  await i18nInstance.init({
    lng: locale,
    resources,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: namespaces[0],
    fallbackNS: namespaces[0],
    ns: namespaces,
    preload: resources ? [] : i18nConfig.locales
  });

  return {
    i18n: i18nInstance,
    resources: i18nInstance.services?.resourceStore.data,
    t: i18nInstance.t
  };
}
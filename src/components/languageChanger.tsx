'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import i18nConfig from '../../i18config';
import { Select, SelectItem } from '@heroui/react';

const languages = [
  "en","fr","ar","de"
]
export default function LanguageChanger() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  const handleChange = ( newLocale: string ) => {
    // set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    // redirect to the new locale path
    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      router.push('/' + newLocale + currentPathname);
    } else {
      router.push(
        currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
      );
    }

    router.refresh();
  };

  return (
      <Select
      onSelectionChange={(e)=>handleChange(Array.from(e)[0] as string)}
      selectionMode='single'
      variant='bordered'
      value={currentLocale}
      classNames={{
        base : "w-[70px] dark",
        trigger:"border-light_blue-500 shadow-none text-logo_color",
        value :"text-light_blue-500",
        selectorIcon:"text-light_blue-500 text-md"
      }}
      defaultSelectedKeys={[currentLocale]}
    >
      {languages.map((lan)=> (<SelectItem key={lan} >{lan.toUpperCase()}</SelectItem>))}
    </Select>
    );
}
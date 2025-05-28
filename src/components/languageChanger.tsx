'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Select, SelectItem } from '@heroui/react';

const languages = [
  "en","fr","ar"
]
export default function LanguageChanger() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    router.push(pathname, {locale: newLocale});
  };

  return (
      <Select
      onSelectionChange={(e)=>handleChange(Array.from(e)[0] as string)}
      selectionMode='single'
      variant='bordered'
      value={currentLocale}
      classNames={{
        base : "w-[100px] dark",
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
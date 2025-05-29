"use client";

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

export default function DirectionProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  useEffect(() => {
    // Update document direction and lang attributes
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', locale);
    
    // Add RTL class to body for additional styling
    if (isRTL) {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
    
    // Update toast container RTL setting
    const updateToastContainer = () => {
      const toastContainer = document.querySelector('.Toastify__toast-container');
      if (toastContainer) {
        if (isRTL) {
          toastContainer.classList.add('Toastify__toast-container--rtl');
        } else {
          toastContainer.classList.remove('Toastify__toast-container--rtl');
        }
      }
    };
    
    // Update immediately
    updateToastContainer();
    
    // Also update after a short delay in case toasts are dynamically added
    const timeoutId = setTimeout(updateToastContainer, 100);
    
    // Debugging information
    if (process.env.NODE_ENV === 'development') {
      console.log(`DirectionProvider: Locale changed to ${locale}, RTL: ${isRTL}`);
      console.log(`Document direction: ${document.documentElement.dir}`);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [locale, isRTL]);

  return <>{children}</>;
}

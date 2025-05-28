// Define the available translation namespaces
export const TRANSLATION_NAMESPACES = [
  'homepage',
  'navigation'
] as const;

export type TranslationNamespace = typeof TRANSLATION_NAMESPACES[number];

/**
 * Load translations for a specific locale
 * @param locale - The locale to load translations for (e.g., 'en', 'fr', 'ar')
 * @returns Promise<Record<string, any>> - Merged translation messages for all namespaces
 */
export async function loadTranslations(locale: string): Promise<Record<string, any>> {
  const messages: Record<string, any> = {};

  // Load all namespaces for the given locale
  for (const namespace of TRANSLATION_NAMESPACES) {
    try {
      // Dynamically import the translation file
      const namespaceMessages = await import(`../../messages/${locale}/${namespace}.json`);
      messages[namespace] = namespaceMessages.default || namespaceMessages;
    } catch {
      // If a namespace file doesn't exist, log a warning but continue
      console.warn(`Translation file not found: messages/${locale}/${namespace}.json`);
      
      // Optionally, try to fall back to English if the current locale is not English
      if (locale !== 'en') {
        try {
          const fallbackMessages = await import(`../../messages/en/${namespace}.json`);
          messages[namespace] = fallbackMessages.default || fallbackMessages;
          console.warn(`Using English fallback for ${namespace} namespace`);
        } catch (fallbackError) {
          console.warn(`No fallback available for ${namespace} namespace`, fallbackError);
          messages[namespace] = {};
        }
      } else {
        // If English files don't exist, provide empty object
        messages[namespace] = {};
      }
    }
  }

  return messages;
}

/**
 * Load translations for specific namespaces only
 * @param locale - The locale to load translations for
 * @param namespaces - Array of namespaces to load
 * @returns Promise<Record<string, any>> - Translation messages for specified namespaces
 */
export async function loadNamespacedTranslations(
  locale: string, 
  namespaces: TranslationNamespace[]
): Promise<Record<string, any>> {
  const messages: Record<string, any> = {};

  for (const namespace of namespaces) {
    try {
      const namespaceMessages = await import(`../../messages/${locale}/${namespace}.json`);
      messages[namespace] = namespaceMessages.default || namespaceMessages;
    } catch {
      console.warn(`Translation file not found: messages/${locale}/${namespace}.json`);
      
      // Try fallback to English
      if (locale !== 'en') {
        try {
          const fallbackMessages = await import(`../../messages/en/${namespace}.json`);
          messages[namespace] = fallbackMessages.default || fallbackMessages;
        } catch {
          messages[namespace] = {};
        }
      } else {
        messages[namespace] = {};
      }
    }
  }

  return messages;
}

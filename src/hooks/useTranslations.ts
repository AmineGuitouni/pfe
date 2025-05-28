import { useTranslations } from 'next-intl';
import type { TranslationNamespace } from '../lib/translations';

/**
 * Custom hook for accessing namespaced translations
 * @param namespace - The translation namespace to use
 * @returns Translation function for the specified namespace
 */
export function useNamespacedTranslations(namespace: TranslationNamespace) {
  return useTranslations(namespace);
}

/**
 * Hook for common translations (buttons, labels, etc.)
 */
export function useCommonTranslations() {
  return useTranslations('common');
}

/**
 * Hook for authentication related translations
 */
export function useAuthTranslations() {
  return useTranslations('auth');
}

/**
 * Hook for dashboard translations
 */
export function useDashboardTranslations() {
  return useTranslations('dashboard');
}

/**
 * Hook for home page translations
 */
export function useHomeTranslations() {
  return useTranslations('home');
}

/**
 * Hook for navigation translations
 */
export function useNavigationTranslations() {
  return useTranslations('navigation');
}

/**
 * Hook for error message translations
 */
export function useErrorTranslations() {
  return useTranslations('errors');
}

/**
 * Hook for form field translations
 */
export function useFormTranslations() {
  return useTranslations('forms');
}

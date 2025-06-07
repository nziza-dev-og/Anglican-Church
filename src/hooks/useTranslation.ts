
"use client";
import { useLanguage } from '@/contexts/LanguageContext';
import { translate as doTranslate, translations } from '@/lib/translations';

export const useTranslation = () => {
  const { currentLocale } = useLanguage();

  const t = (key: string): string => {
    // Ensure the key exists to avoid returning the key itself if not found, or handle as preferred
    if (!translations[key]) {
      console.warn(`Translation key "${key}" not found.`);
      return key;
    }
    return doTranslate(key, currentLocale);
  };

  return { t, currentLocale };
};

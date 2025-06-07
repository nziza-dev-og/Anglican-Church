
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Locale } from '@/lib/translations';
import { locales as availableLocales } from '@/lib/translations'; // Import available locales

interface LanguageContextType {
  currentLocale: Locale;
  setCurrentLocale: (locale: Locale) => void;
  availableLocales: { code: Locale; name: string; flag?: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLocale, setCurrentLocaleState] = useState<Locale>('en'); // Default to English

  // Load saved locale from localStorage or default
  useEffect(() => {
    const savedLocale = localStorage.getItem('app-locale') as Locale | null;
    if (savedLocale && availableLocales.find(l => l.code === savedLocale)) {
      setCurrentLocaleState(savedLocale);
    }
  }, []);

  const setCurrentLocale = (locale: Locale) => {
    setCurrentLocaleState(locale);
    localStorage.setItem('app-locale', locale); // Save preference
  };

  return (
    <LanguageContext.Provider value={{ currentLocale, setCurrentLocale, availableLocales }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Locale } from '@/lib/translations';
import { locales as availableLocales } from '@/lib/translations';

interface LanguageContextType {
  currentLocale: Locale;
  setCurrentLocale: (locale: Locale) => void;
  availableLocales: { code: Locale; name: string; flag?: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLocale, setCurrentLocaleState] = useState<Locale>('en'); // Default to English

  // Effect for initializing locale from localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem('app-locale') as Locale | null;
    if (savedLocale && availableLocales.find(l => l.code === savedLocale)) {
      setCurrentLocaleState(savedLocale);
    }
    // The HTML lang attribute will be updated by the effect below once currentLocale is set
  }, []); // Runs once on mount

  // Effect for updating HTML lang attribute whenever currentLocale changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = currentLocale;
    }
  }, [currentLocale]);

  const setCurrentLocale = (locale: Locale) => {
    setCurrentLocaleState(locale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-locale', locale);
      // The useEffect above will handle updating document.documentElement.lang
    }
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

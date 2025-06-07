
"use client";
import type { ReactNode } from 'react';
import Logo from '@/components/shared/Logo';
import { useTranslation } from '@/hooks/useTranslation';

interface AuthLayoutProps {
  children: ReactNode;
  title: string; // Title will be passed already translated
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center items-center">
          <Logo textSize="text-3xl" iconSize={36} className="mb-4" />
          <h1 className="text-2xl font-headline font-semibold tracking-tight text-primary">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.welcomeMessage')}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}


"use client";

import type { ReactNode } from 'react';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation'; // Import useTranslation

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { loading } = useAuth();
  const { t } = useTranslation(); // Use the translation hook

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} {t('appName')}. {t('footer.rights')}
      </footer>
    </div>
  );
}

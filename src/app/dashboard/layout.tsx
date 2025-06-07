
"use client";
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation(); // Initialize useTranslation

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !loading) {
    router.push('/auth/login?redirect=/dashboard'); // Added redirect query param
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header /> {/* Header is sticky, h-16 (4rem) */}
      
      <div className="flex flex-1">
        {/* Desktop Sidebar: Fixed, hidden on mobile */}
        <aside className="hidden md:fixed md:left-0 md:top-16 md:bottom-0 md:z-30 md:flex md:w-64 md:flex-col border-r border-border bg-card">
          {/* top-16 to position below Header, bottom-0 to fill height */}
          <DashboardSidebar />
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto pt-20 md:pt-6 md:ml-64">
          {/* pt-20 on mobile (16 for header + 4 for space), md:pt-6 for desktop. md:ml-64 for sidebar. */}
          {children}
        </main>
      </div>
       <footer className="py-6 text-center text-sm text-muted-foreground border-t md:ml-64">
        {/* md:ml-64 to align with main content on desktop */}
        © {new Date().getFullYear()} {t('appName')}. {t('footer.rights')}
      </footer>
    </div>
  );
}

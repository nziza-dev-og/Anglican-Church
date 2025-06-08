
"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  UserCircle,
  Settings,
  LayoutDashboard,
  Menu,
  Globe,
  Home,
  Info,
  CalendarDays,
  BookOpen,
  Users as UsersIcon, // Renamed to avoid conflict with Users type
  Music,
  Handshake,
  Video,
  ShieldCheck,
  Mails, 
  MessageSquare,
  Briefcase, // Added for Leadership
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from '@/components/shared/Logo';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from './SidebarNav';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'; // Import DashboardSidebar
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import type { Locale } from '@/lib/translations';
import type { ReactNode } from 'react';

interface NavLink {
  labelKey: string;
  href: string;
  icon?: ReactNode;
}

export default function Header() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [mobileAdminNavOpen, setMobileAdminNavOpen] = React.useState(false); // State for admin sidebar
  const { currentLocale, setCurrentLocale, availableLocales } = useLanguage();
  const { t } = useTranslation();

  const NAV_ITEMS: NavLink[] = [
    { labelKey: 'nav.home', href: '/', icon: <Home className="h-5 w-5" /> },
    { labelKey: 'nav.about', href: '/about', icon: <Info className="h-5 w-5" /> },
    { labelKey: 'nav.leadership', href: '/leadership', icon: <Briefcase className="h-5 w-5" /> },
    { labelKey: 'nav.events', href: '/events', icon: <CalendarDays className="h-5 w-5" /> },
    { labelKey: 'nav.books', href: '/books', icon: <BookOpen className="h-5 w-5" /> },
    { labelKey: 'nav.choirs', href: '/choirs', icon: <Music className="h-5 w-5" /> },
    { labelKey: 'nav.unions', href: '/unions', icon: <Handshake className="h-5 w-5" /> },
    { labelKey: 'nav.videos', href: '/videos', icon: <Video className="h-5 w-5" /> },
    { labelKey: 'nav.ceremonies', href: '/ceremonies', icon: <ShieldCheck className="h-5 w-5" /> },
    { labelKey: 'nav.contact', href: '/contact', icon: <Mails className="h-5 w-5" /> },
    { labelKey: 'nav.chat', href: '/chat', icon: <MessageSquare className="h-5 w-5" /> },
  ];
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  const isOnDashboard = pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {/* Mobile Dashboard Nav Trigger */}
          {isOnDashboard && user && (
            <Sheet open={mobileAdminNavOpen} onOpenChange={setMobileAdminNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t('sidebar.menuTitle')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground">
                <SheetHeader className="p-4 border-b border-sidebar-border flex flex-row items-center justify-between">
                  <Logo textSize="text-2xl" />
                  <SheetTitle>{t('sidebar.menuTitle')}</SheetTitle>
                </SheetHeader>
                <DashboardSidebar onLinkClick={() => setMobileAdminNavOpen(false)} />
              </SheetContent>
            </Sheet>
          )}

          {/* Main Mobile Nav Trigger (hidden on dashboard) */}
          {!isOnDashboard && (
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t('header.mobileMenuTitle')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground">
                 <SheetHeader className="p-4 border-b border-sidebar-border flex flex-row items-center justify-between">
                  <Logo textSize="text-2xl"/>
                  <SheetTitle>{t('header.mobileMenuTitle')}</SheetTitle> 
                </SheetHeader>
                <SidebarNav 
                  items={NAV_ITEMS.map(item => ({ ...item, label: t(item.labelKey), icon: item.icon }))} 
                  isMobile={true} 
                  onLinkClick={() => setMobileNavOpen(false)}
                />
              </SheetContent>
            </Sheet>
          )}
          <Logo className="hidden md:flex" />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.labelKey}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
                <span className="sr-only">{t('header.selectLanguage')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('header.languages')}</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={currentLocale} onValueChange={(value) => setCurrentLocale(value as Locale)}>
                {availableLocales.map((locale) => (
                  <DropdownMenuRadioItem key={locale.code} value={locale.code}>
                    {locale.flag && <span className="mr-2">{locale.flag}</span>}
                    {locale.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userProfile?.photoURL || undefined} alt={userProfile?.displayName || 'User'} />
                    <AvatarFallback>{getInitials(userProfile?.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.displayName || t('general.notAvailableShort')}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground pt-1">
                      {t('header.userRole')} {userProfile?.role ? t(`userRoles.${userProfile.role.toLowerCase().replace(new RegExp(/\s+/g), '')}`) : t('general.notAvailableShort')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>{t('header.dashboard')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>{t('header.profile')}</span>
                </DropdownMenuItem>
                {(userProfile?.role === 'Church Admin' || userProfile?.role === 'Super Admin') && (
                  <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('header.adminSettings')}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('header.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={() => router.push('/auth/login')} className="w-full sm:w-auto">
                {t('auth.login')}
              </Button>
              <Button onClick={() => router.push('/auth/register')} className="w-full sm:w-auto">
                {t('auth.register')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle, Settings, LayoutDashboard, Menu, Globe } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from './SidebarNav';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import type { Locale } from '@/lib/translations';


export default function Header() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const { currentLocale, setCurrentLocale, availableLocales } = useLanguage();
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { labelKey: 'nav.home', href: '/' },
    { labelKey: 'nav.about', href: '/about' },
    { labelKey: 'nav.events', href: '/events' },
    { labelKey: 'nav.books', href: '/books' },
    { labelKey: 'nav.choirs', href: '/choirs' },
    { labelKey: 'nav.unions', href: '/unions' },
    { labelKey: 'nav.videos', href: '/videos' },
    { labelKey: 'nav.ceremonies', href: '/ceremonies' },
    { labelKey: 'nav.contact', href: '/contact' },
  ];
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground">
              <div className="p-4 border-b border-sidebar-border">
                <Logo textSize="text-2xl" />
              </div>
              <SidebarNav 
                items={NAV_ITEMS.map(item => ({ ...item, label: t(item.labelKey) }))} 
                isMobile={true} 
                onLinkClick={() => setMobileNavOpen(false)}
              />
            </SheetContent>
          </Sheet>
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
                <span className="sr-only">Select Language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Languages</DropdownMenuLabel>
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
                    <p className="text-sm font-medium leading-none">{userProfile?.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground pt-1">
                      Role: {userProfile?.role}
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

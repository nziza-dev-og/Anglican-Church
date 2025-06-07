
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
// No direct translation needed here if labels are passed pre-translated from Header

interface NavItem {
  label: string; // Label is now pre-translated
  href: string;
  icon?: React.ReactNode; 
}

interface SidebarNavProps {
  items: NavItem[];
  isMobile?: boolean;
  onLinkClick?: () => void; 
}

export function SidebarNav({ items, isMobile, onLinkClick }: SidebarNavProps) {
  const pathname = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <nav className={cn("flex flex-col gap-1 px-2 py-4", isMobile ? "w-full" : "md:w-full")}>
      {items.map((item, index) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={index}
            href={item.href}
            onClick={onLinkClick} 
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground",
              isMobile ? "text-base" : "" 
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.icon && <span className="h-5 w-5">{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}


"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  BookOpen,
  Video,
  CalendarCheck2,
  Users,
  ShieldCheck,
  Settings,
  Music,
  Building, // Consider changing if a better icon for Unions exists or using Handshake
  Handshake, // Keeping for Unions for now
  Briefcase,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface NavItem {
  href: string;
  labelKey: string; // Changed to labelKey for translation
  icon: ReactNode;
  roles?: string[]; 
}

const allNavItems: NavItem[] = [
  { href: "/dashboard", labelKey: "sidebar.overview", icon: <LayoutDashboard /> },
  { href: "/dashboard/profile", labelKey: "sidebar.myProfile", icon: <User /> },
  // Admin Section
  { href: "/dashboard/admin/users", labelKey: "sidebar.manageUsers", icon: <Users />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/events", labelKey: "sidebar.manageEvents", icon: <CalendarCheck2 />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/books", labelKey: "sidebar.manageBooks", icon: <BookOpen />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/videos", labelKey: "sidebar.manageVideos", icon: <Video />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/ceremonies", labelKey: "sidebar.manageCeremonies", icon: <ShieldCheck />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/choirs", labelKey: "sidebar.manageChoirsInfo", icon: <Music />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/unions", labelKey: "sidebar.manageUnionsInfo", icon: <Handshake />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] }, // Using Handshake for Unions
  // Pastor/Diacon Section
  { href: "/dashboard/members", labelKey: "sidebar.viewMembers", icon: <Users />, roles: [USER_ROLES.CHIEF_PASTOR, USER_ROLES.PASTOR, USER_ROLES.DIACON, USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] }, // Expanded roles based on existing code
  { href: "/dashboard/activities", labelKey: "sidebar.manageActivities", icon: <Briefcase />, roles: [USER_ROLES.CHIEF_PASTOR, USER_ROLES.PASTOR, USER_ROLES.DIACON] },
  // Choir Admin Section
  { href: "/dashboard/choir-admin/manage", labelKey: "sidebar.manageMyChoir", icon: <Music />, roles: [USER_ROLES.CHOIR_ADMIN] },
  // Union Admin Section
  { href: "/dashboard/union-admin/manage", labelKey: "sidebar.manageMyUnion", icon: <Handshake />, roles: [USER_ROLES.UNION_ADMIN] },
  // General Settings (could be for Super Admin only)
  { href: "/dashboard/settings", labelKey: "sidebar.appSettings", icon: <Settings />, roles: [USER_ROLES.SUPER_ADMIN] },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  const { t } = useTranslation();

  if (!userProfile) return null;

  const visibleNavItems = allNavItems.filter(item => {
    if (!item.roles) return true; 
    return item.roles.includes(userProfile.role);
  });

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border p-4 space-y-2">
      <h2 className="text-lg font-semibold text-primary px-2 mb-4">{t('sidebar.menuTitle')}</h2>
      <nav className="flex flex-col space-y-1">
        {visibleNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.icon}
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

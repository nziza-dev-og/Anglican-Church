
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
  Handshake,
  Briefcase,
  MailWarning,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface NavItem {
  href: string;
  labelKey: string; 
  icon: ReactNode;
  roles?: string[]; 
}

interface DashboardSidebarProps {
  onLinkClick?: () => void; // Optional prop to handle link clicks
}

const allNavItems: NavItem[] = [
  { href: "/dashboard", labelKey: "sidebar.overview", icon: <LayoutDashboard /> },
  { href: "/dashboard/profile", labelKey: "sidebar.myProfile", icon: <User /> },
  { href: "/dashboard/admin/users", labelKey: "sidebar.manageUsers", icon: <Users />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/events", labelKey: "sidebar.manageEvents", icon: <CalendarCheck2 />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/books", labelKey: "sidebar.manageBooks", icon: <BookOpen />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/videos", labelKey: "sidebar.manageVideos", icon: <Video />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/ceremonies", labelKey: "sidebar.manageCeremonies", icon: <ShieldCheck />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/choirs", labelKey: "sidebar.manageChoirsInfo", icon: <Music />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/unions", labelKey: "sidebar.manageUnionsInfo", icon: <Handshake />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/contact-messages", labelKey: "sidebar.manageContactMessages", icon: <MailWarning />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/members", labelKey: "sidebar.viewMembers", icon: <Users />, roles: [USER_ROLES.CHIEF_PASTOR, USER_ROLES.PASTOR, USER_ROLES.DIACON, USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/activities", labelKey: "sidebar.manageActivities", icon: <Briefcase />, roles: [USER_ROLES.CHIEF_PASTOR, USER_ROLES.PASTOR, USER_ROLES.DIACON] },
  { href: "/dashboard/choir-admin/manage", labelKey: "sidebar.manageMyChoir", icon: <Music />, roles: [USER_ROLES.CHOIR_ADMIN] },
  { href: "/dashboard/union-admin/manage", labelKey: "sidebar.manageMyUnion", icon: <Handshake />, roles: [USER_ROLES.UNION_ADMIN] },
  { href: "/dashboard/settings", labelKey: "sidebar.appSettings", icon: <Settings />, roles: [USER_ROLES.SUPER_ADMIN] },
];

export default function DashboardSidebar({ onLinkClick }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  const { t } = useTranslation();

  if (!userProfile) return null;

  const visibleNavItems = allNavItems.filter(item => {
    if (!item.roles) return true; 
    return item.roles.includes(userProfile.role);
  }).sort((a, b) => {
    const aIsAdmin = a.href.startsWith('/dashboard/admin/');
    const bIsAdmin = b.href.startsWith('/dashboard/admin/');
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;
    return 0;
  });

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-2 overflow-y-auto">
      <h2 className="text-lg font-semibold text-sidebar-primary px-2 mb-4">{t('sidebar.menuTitle')}</h2>
      <nav className="flex flex-col space-y-1">
        {visibleNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            {item.icon}
            {t(item.labelKey)}
          </Link>
        ))}
      </nav>
    </div>
  );
}

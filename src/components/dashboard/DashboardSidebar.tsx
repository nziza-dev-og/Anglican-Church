
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
  Building,
  Handshake,
  Briefcase,
} from "lucide-react";
import type { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  roles?: string[]; // Roles that can see this item
}

const allNavItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard /> },
  { href: "/dashboard/profile", label: "My Profile", icon: <User /> },
  // Admin Section
  { href: "/dashboard/admin/users", label: "Manage Users", icon: <Users />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/events", label: "Manage Events", icon: <CalendarCheck2 />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/books", label: "Manage Books", icon: <BookOpen />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/videos", label: "Manage Videos", icon: <Video />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/ceremonies", label: "Manage Ceremonies", icon: <ShieldCheck />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/choirs", label: "Manage Choirs Info", icon: <Music />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { href: "/dashboard/admin/unions", label: "Manage Unions Info", icon: <Building />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  // Pastor/Diacon Section
  { href: "/dashboard/members", label: "View Members", icon: <Users />, roles: [USER_ROLES.CHIEF_PASTOR, USER_ROLES.PASTOR, USER_ROLES.DIACON] },
  { href: "/dashboard/activities", label: "Manage Activities", icon: <Briefcase />, roles: [USER_ROLES.CHIEF_PASTOR, USER_ROLES.PASTOR, USER_ROLES.DIACON] },
  // Choir Admin Section
  { href: "/dashboard/choir-admin/manage", label: "Manage My Choir", icon: <Music />, roles: [USER_ROLES.CHOIR_ADMIN] },
  // Union Admin Section
  { href: "/dashboard/union-admin/manage", label: "Manage My Union", icon: <Handshake />, roles: [USER_ROLES.UNION_ADMIN] },
  // General Settings (could be for Super Admin only)
  { href: "/dashboard/settings", label: "App Settings", icon: <Settings />, roles: [USER_ROLES.SUPER_ADMIN] },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  const visibleNavItems = allNavItems.filter(item => {
    if (!item.roles) return true; // No specific roles means visible to all authenticated users
    return item.roles.includes(userProfile.role);
  });

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border p-4 space-y-2">
      <h2 className="text-lg font-semibold text-primary px-2 mb-4">Dashboard Menu</h2>
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
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}


"use client";
import { useAuth } from "@/hooks/useAuth";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { USER_ROLES } from "@/lib/constants";
import { Briefcase, BookOpen, CalendarCheck2, Handshake, LayoutDashboard, Music, Settings, ShieldCheck, User, Users, Video, MailWarning } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardSection {
  titleKey: string;
  descriptionKey: string;
  link: string;
  icon: ReactNode;
  roles: string[]; 
}

const dashboardSections: DashboardSection[] = [
  { titleKey: "dashboard.profile.title", descriptionKey: "dashboard.profile.description", link: "/dashboard/profile", icon: <User className="h-6 w-6 text-accent" />, roles: Object.values(USER_ROLES) },
  { titleKey: "dashboard.admin.users.title", descriptionKey: "dashboard.admin.users.description", link: "/dashboard/admin/users", icon: <Users className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { titleKey: "dashboard.admin.events.title", descriptionKey: "dashboard.admin.events.description", link: "/dashboard/admin/events", icon: <CalendarCheck2 className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { titleKey: "dashboard.admin.books.title", descriptionKey: "dashboard.admin.books.description", link: "/dashboard/admin/books", icon: <BookOpen className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { titleKey: "dashboard.admin.videos.title", descriptionKey: "dashboard.admin.videos.description", link: "/dashboard/admin/videos", icon: <Video className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { titleKey: "dashboard.admin.ceremonies.title", descriptionKey: "dashboard.admin.ceremonies.description", link: "/dashboard/admin/ceremonies", icon: <ShieldCheck className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { titleKey: "dashboard.admin.choirs.title", descriptionKey: "dashboard.admin.choirs.description", link: "/dashboard/admin/choirs", icon: <Music className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { titleKey: "dashboard.admin.unions.title", descriptionKey: "dashboard.admin.unions.description", link: "/dashboard/admin/unions", icon: <Handshake className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { titleKey: "dashboard.admin.contactMessages.title", descriptionKey: "dashboard.admin.contactMessages.description", link: "/dashboard/admin/contact-messages", icon: <MailWarning className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { titleKey: "dashboard.admin.settings.title", descriptionKey: "dashboard.admin.settings.description", link: "/dashboard/settings", icon: <Settings className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN] },
  { titleKey: "dashboard.pastor.members.title", descriptionKey: "dashboard.pastor.members.description", link: "/dashboard/members", icon: <Users className="h-6 w-6 text-accent" />, roles: [USER_ROLES.CHIEF_PASTOR, USER_ROLES.PASTOR, USER_ROLES.DIACON, USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { titleKey: "dashboard.pastor.activities.title", descriptionKey: "dashboard.pastor.activities.description", link: "/dashboard/activities", icon: <Briefcase className="h-6 w-6 text-accent" />, roles: [USER_ROLES.CHIEF_PASTOR, USER_ROLES.PASTOR, USER_ROLES.DIACON] },
  { titleKey: "dashboard.choirAdmin.manage.title", descriptionKey: "dashboard.choirAdmin.manage.description", link: "/dashboard/choir-admin/manage", icon: <Music className="h-6 w-6 text-accent" />, roles: [USER_ROLES.CHOIR_ADMIN] },
  { titleKey: "dashboard.unionAdmin.manage.title", descriptionKey: "dashboard.unionAdmin.manage.description", link: "/dashboard/union-admin/manage", icon: <Handshake className="h-6 w-6 text-accent" />, roles: [USER_ROLES.UNION_ADMIN] },
];


export default function DashboardPage() {
  const { userProfile } = useAuth();
  const { t } = useTranslation();

  if (!userProfile) {
    return (
      <div>
        <PageTitle title={t('header.dashboard')} subtitle={t('general.loading')} />
        <p>{t('general.loading')}</p>
      </div>
    );
  }

  const availableSections = dashboardSections.filter(section => section.roles.includes(userProfile.role));

  return (
    <div>
      <PageTitle
        title={`${t('dashboard.welcome')} ${userProfile.displayName || 'User'}!`}
        subtitle={`${t('dashboard.overviewSubtitle')} ${t(`userRoles.${userProfile.role.toLowerCase().replace(/\s+/g, '')}`)}`}
      />
      {availableSections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableSections.map((section) => (
            <Card key={section.link} className="card-animated hover:shadow-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium font-body text-primary">
                  {t(section.titleKey)}
                </CardTitle>
                {section.icon}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t(section.descriptionKey)}</p>
                <Button asChild className="w-full btn-animated">
                  <Link href={section.link}>{`${t('dashboard.card.goTo')} ${t(section.titleKey)}`}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
         <Card>
            <CardHeader>
                <CardTitle>{t('dashboard.noSections.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{t('dashboard.noSections.description')}</p>
                 <Button asChild className="mt-4">
                  <Link href="/dashboard/profile">{t('dashboard.profile.title')}</Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}


"use client";
import { useAuth } from "@/hooks/useAuth";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { USER_ROLES } from "@/lib/constants";
import { Briefcase, BookOpen, CalendarCheck2, Handshake, LayoutDashboard, Music, Settings, ShieldCheck, User, Users, Video } from "lucide-react";
import type { ReactNode } from "react";

interface DashboardSection {
  title: string;
  description: string;
  link: string;
  icon: ReactNode;
  roles: string[]; // User roles that can see this section
}

const dashboardSections: DashboardSection[] = [
  { title: "My Profile", description: "View and update your personal information.", link: "/dashboard/profile", icon: <User className="h-6 w-6 text-accent" />, roles: Object.values(USER_ROLES) },
  // Admin sections
  { title: "Manage Users", description: "Oversee user accounts and roles.", link: "/dashboard/admin/users", icon: <Users className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { title: "Manage Events", description: "Create and update church events.", link: "/dashboard/admin/events", icon: <CalendarCheck2 className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { title: "Manage Books", description: "Add and organize digital library content.", link: "/dashboard/admin/books", icon: <BookOpen className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { title: "Manage Videos", description: "Upload and manage video gallery.", link: "/dashboard/admin/videos", icon: <Video className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { title: "Manage Ceremonies", description: "Record and share church ceremonies.", link: "/dashboard/admin/ceremonies", icon: <ShieldCheck className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { title: "Manage Choirs Info", description: "Update general information about choirs.", link: "/dashboard/admin/choirs", icon: <Music className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { title: "Manage Unions Info", description: "Update general information about unions.", link: "/dashboard/admin/unions", icon: <Handshake className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.CHURCH_ADMIN] },
  { title: "App Settings", description: "Configure application-wide settings.", link: "/dashboard/settings", icon: <Settings className="h-6 w-6 text-accent" />, roles: [USER_ROLES.SUPER_ADMIN] },
  // Pastor/Diacon specific
  { title: "View Members List", description: "Access the church member directory.", link: "/dashboard/members", icon: <Users className="h-6 w-6 text-accent" />, roles: [USER_ROLES.CHIEF_PASTOR, USER_ROLES.PASTOR, USER_ROLES.DIACON, USER_ROLES.SUPER_ADMIN] },
  { title: "Manage Activities", description: "Oversee specific church activities.", link: "/dashboard/activities", icon: <Briefcase className="h-6 w-6 text-accent" />, roles: [USER_ROLES.CHIEF_PASTOR, USER_ROLES.PASTOR, USER_ROLES.DIACON] },
  // Choir Admin specific
  { title: "Manage My Choir", description: "Administer your choir members and events.", link: "/dashboard/choir-admin/manage", icon: <Music className="h-6 w-6 text-accent" />, roles: [USER_ROLES.CHOIR_ADMIN] },
  // Union Admin specific
  { title: "Manage My Union", description: "Administer your union members and events.", link: "/dashboard/union-admin/manage", icon: <Handshake className="h-6 w-6 text-accent" />, roles: [USER_ROLES.UNION_ADMIN] },
];


export default function DashboardPage() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <div>
        <PageTitle title="Dashboard" subtitle="Loading your dashboard..." />
        <p>Please wait while we fetch your information.</p>
      </div>
    );
  }

  const availableSections = dashboardSections.filter(section => section.roles.includes(userProfile.role));

  return (
    <div>
      <PageTitle
        title={`Welcome, ${userProfile.displayName || 'User'}!`}
        subtitle={`Here's an overview of your dashboard. Your role: ${userProfile.role}`}
      />
      {availableSections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableSections.map((section) => (
            <Card key={section.link} className="card-animated hover:shadow-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium font-body text-primary">
                  {section.title}
                </CardTitle>
                {section.icon}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                <Button asChild className="w-full btn-animated">
                  <Link href={section.link}>Go to {section.title}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
         <Card>
            <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You currently don't have specific sections assigned to your role other than profile management. Explore the site or contact an administrator if you believe this is an error.</p>
                 <Button asChild className="mt-4">
                  <Link href="/dashboard/profile">View My Profile</Link>
                </Button>
            </CardContent>
        </Card>
      )}
       {/* Placeholder for future personalized content recommendations on dashboard */}
       {/* <div className="mt-12">
          <PersonalizedRecommendations /> 
       </div> */}
    </div>
  );
}

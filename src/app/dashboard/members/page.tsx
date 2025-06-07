
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";

export default function ViewMembersPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const authorizedRoles = [
    USER_ROLES.CHIEF_PASTOR,
    USER_ROLES.PASTOR,
    USER_ROLES.DIACON,
    USER_ROLES.SUPER_ADMIN, 
    USER_ROLES.CHURCH_ADMIN 
  ];

  useEffect(() => {
    if (!authLoading && userProfile && !authorizedRoles.includes(userProfile.role)) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router, authorizedRoles]); // Added authorizedRoles to dependency array

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title={t('dashboard.members.pageTitle')} />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={t('dashboard.members.pageTitle')}
        subtitle={t('dashboard.members.pageSubtitle')}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.members.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('dashboard.members.description')}
          </p>
          {/* Placeholder for Member List Table/Cards */}
        </CardContent>
      </Card>
    </div>
  );
}

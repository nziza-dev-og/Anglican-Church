
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";

export default function ManageActivitiesPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const authorizedRoles = [
    USER_ROLES.CHIEF_PASTOR,
    USER_ROLES.PASTOR,
    USER_ROLES.DIACON,
  ];

  useEffect(() => {
    if (!authLoading && userProfile && !authorizedRoles.includes(userProfile.role)) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router, authorizedRoles]); // Added authorizedRoles to dependency array

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title={t('dashboard.activities.pageTitle')} />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={t('dashboard.activities.pageTitle')}
        subtitle={t('dashboard.activities.pageSubtitle')}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.activities.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('dashboard.activities.description')}
          </p>
          {/* Placeholder for Activity Management tools */}
        </CardContent>
      </Card>
    </div>
  );
}

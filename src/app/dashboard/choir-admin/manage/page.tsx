
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";

export default function ManageChoirPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && userProfile && userProfile.role !== USER_ROLES.CHOIR_ADMIN) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title={t('dashboard.choirAdmin.manage.pageTitle')} />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={t('dashboard.choirAdmin.manage.pageTitle')}
        subtitle={t('dashboard.choirAdmin.manage.pageSubtitle')}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.choirAdmin.manage.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('dashboard.choirAdmin.manage.description')}
          </p>
          {/* Placeholder for Choir Member Management, Choir Event Form, etc. */}
        </CardContent>
      </Card>
    </div>
  );
}


"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
// TODO: Implement actual application settings.
// For now, this is a placeholder page for Super Admins.

export default function AppSettingsPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && userProfile && userProfile.role !== USER_ROLES.SUPER_ADMIN) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title={t('dashboard.settings.pageTitle')} />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={t('dashboard.settings.pageTitle')}
        subtitle={t('dashboard.settings.pageSubtitle')}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.settings.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('dashboard.settings.description')}
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>{t('dashboard.settings.listItem1')}</li>
            <li>{t('dashboard.settings.listItem2')}</li>
            <li>{t('dashboard.settings.listItem3')}</li>
            <li>{t('dashboard.settings.listItem4')}</li>
          </ul>
          {/* Placeholder for actual settings controls */}
        </CardContent>
      </Card>
    </div>
  );
}

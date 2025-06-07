
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
// TODO: Implement actual union management (members, union-specific events).
// For now, this is a placeholder page for Union Admins.

export default function ManageUnionPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && userProfile && userProfile.role !== USER_ROLES.UNION_ADMIN) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title={t('dashboard.unionAdmin.manage.pageTitle')} />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={t('dashboard.unionAdmin.manage.pageTitle')}
        subtitle={t('dashboard.unionAdmin.manage.pageSubtitle')}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.unionAdmin.manage.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('dashboard.unionAdmin.manage.description')}
          </p>
          {/* Placeholder for Union Member Management, Union Event Form, etc. */}
        </CardContent>
      </Card>
    </div>
  );
}

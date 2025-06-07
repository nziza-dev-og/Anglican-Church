
"use client";
import UserProfileForm from "@/components/dashboard/UserProfileForm";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProfilePage() {
  const { userProfile, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  if (authLoading) {
    return (
      <div>
        <PageTitle title={t('dashboard.profile.pageTitle')} />
        <Card>
          <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
     return (
      <div>
        <PageTitle title={t('dashboard.profile.pageTitle')} subtitle={t('dashboard.profile.notLoggedIn')} />
      </div>
    );
  }

  return (
    <div>
      <PageTitle title={t('dashboard.profile.pageTitle')} subtitle={t('dashboard.profile.pageSubtitle')} />
      <Card className="max-w-2xl mx-auto card-animated">
        <CardHeader>
          <CardTitle className="font-body">{t('dashboard.profile.form.editTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}

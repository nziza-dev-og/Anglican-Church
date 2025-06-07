
"use client";
import UserProfileForm from "@/components/dashboard/UserProfileForm";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { userProfile, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div>
        <PageTitle title="My Profile" />
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
        <PageTitle title="My Profile" subtitle="Please log in to view your profile." />
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="My Profile" subtitle="View and update your personal information." />
      <Card className="max-w-2xl mx-auto card-animated">
        <CardHeader>
          <CardTitle className="font-body">Edit Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}

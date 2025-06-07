
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// TODO: Implement actual activity management.
// For now, this is a placeholder page for Pastors/Diacons.

export default function ManageActivitiesPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const authorizedRoles = [
    USER_ROLES.CHIEF_PASTOR,
    USER_ROLES.PASTOR,
    USER_ROLES.DIACON,
  ];

  useEffect(() => {
    if (!authLoading && userProfile && !authorizedRoles.includes(userProfile.role)) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title="Manage Activities" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Manage Activities"
        subtitle="Oversee and manage church-related activities."
      />
      <Card>
        <CardHeader>
          <CardTitle>Activity Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section is for Pastors and Diacons to manage specific church activities they are responsible for.
            This might include smaller group meetings, pastoral care coordination, or specific ministry tasks.
            This could be integrated with the main events system or be a separate module.
          </p>
          {/* Placeholder for Activity Management tools */}
        </CardContent>
      </Card>
    </div>
  );
}

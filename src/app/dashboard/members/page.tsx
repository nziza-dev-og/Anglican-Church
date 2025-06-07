
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// TODO: Implement actual member list view.
// For now, this is a placeholder page for Pastors/Diacons/SuperAdmins.

export default function ViewMembersPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const authorizedRoles = [
    USER_ROLES.CHIEF_PASTOR,
    USER_ROLES.PASTOR,
    USER_ROLES.DIACON,
    USER_ROLES.SUPER_ADMIN, // Super admin can also view
    USER_ROLES.CHURCH_ADMIN // Church admin might also need this
  ];

  useEffect(() => {
    if (!authLoading && userProfile && !authorizedRoles.includes(userProfile.role)) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title="View Members" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="View Members"
        subtitle="Access and view the list of church members."
      />
      <Card>
        <CardHeader>
          <CardTitle>Church Member Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will display a list of all church members. Functionality for searching, filtering,
            and viewing member details will be available.
          </p>
          {/* Placeholder for Member List Table/Cards */}
        </CardContent>
      </Card>
    </div>
  );
}


"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// TODO: Implement actual ceremony management form and list
// For now, this is a placeholder page

export default function AdminCeremoniesPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && userProfile &&
        (userProfile.role !== USER_ROLES.CHURCH_ADMIN && userProfile.role !== USER_ROLES.SUPER_ADMIN)) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title="Manage Ceremonies" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Manage Ceremonies"
        subtitle="Record and manage details of church ceremonies."
      />
      <Card>
        <CardHeader>
          <CardTitle>Ceremony Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ceremony management functionality will be implemented here. Admins will be able to add new ceremonies,
            titles, dates, descriptions, and upload related media like photos or videos.
          </p>
          {/* Placeholder for CeremonyForm and CeremonyList */}
        </CardContent>
      </Card>
    </div>
  );
}


"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// TODO: Implement actual event management form and list
// For now, this is a placeholder page

export default function AdminEventsPage() {
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
        <PageTitle title="Manage Events" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Manage Events"
        subtitle="Create, update, and manage church events."
      />
      <Card>
        <CardHeader>
          <CardTitle>Events Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Event management functionality will be implemented here. Admins will be able to add new events,
            edit existing ones, and manage event details like dates, times, locations, and descriptions.
          </p>
          {/* Placeholder for EventForm and EventList */}
        </CardContent>
      </Card>
    </div>
  );
}

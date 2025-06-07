
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// TODO: Implement actual choir management (members, choir-specific events).
// For now, this is a placeholder page for Choir Admins.

export default function ManageChoirPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && userProfile && userProfile.role !== USER_ROLES.CHOIR_ADMIN) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title="Manage My Choir" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Manage My Choir"
        subtitle="Administer your choir members, events, and announcements."
      />
      <Card>
        <CardHeader>
          <CardTitle>Choir Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            As a Choir Admin, you can manage your choir's members (approve requests, view list),
            schedule practices or choir-specific events, and post announcements for your choir.
          </p>
          {/* Placeholder for Choir Member Management, Choir Event Form, etc. */}
        </CardContent>
      </Card>
    </div>
  );
}

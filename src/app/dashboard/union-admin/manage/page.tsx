
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// TODO: Implement actual union management (members, union-specific events).
// For now, this is a placeholder page for Union Admins.

export default function ManageUnionPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && userProfile && userProfile.role !== USER_ROLES.UNION_ADMIN) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title="Manage My Union" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Manage My Union"
        subtitle="Administer your union members, events, and communications."
      />
      <Card>
        <CardHeader>
          <CardTitle>Union Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            As a Union Admin, you can manage your union's members (approve requests, view list),
            schedule meetings or union-specific events, and post announcements for your union.
          </p>
          {/* Placeholder for Union Member Management, Union Event Form, etc. */}
        </CardContent>
      </Card>
    </div>
  );
}

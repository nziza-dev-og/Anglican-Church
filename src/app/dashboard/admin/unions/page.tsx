
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// TODO: Implement actual union info management form and list
// For now, this is a placeholder page for general union info management by Church/Super Admins

export default function AdminUnionsPage() {
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
        <PageTitle title="Manage Unions Info" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Manage Unions Info"
        subtitle="Update general information about church unions."
      />
      <Card>
        <CardHeader>
          <CardTitle>Union Information Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Church Admins and Super Admins can manage general union information here, such as creating new union entries,
            updating descriptions, or assigning union administrators. Union-specific member and event management
            is handled by Union Admins in their dedicated section.
          </p>
          {/* Placeholder for UnionInfoForm and UnionInfoList */}
        </CardContent>
      </Card>
    </div>
  );
}

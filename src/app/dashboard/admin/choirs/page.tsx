
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// TODO: Implement actual choir info management form and list
// For now, this is a placeholder page for general choir info management by Church/Super Admins

export default function AdminChoirsPage() {
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
        <PageTitle title="Manage Choirs Info" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Manage Choirs Info"
        subtitle="Update general information about church choirs."
      />
      <Card>
        <CardHeader>
          <CardTitle>Choir Information Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Church Admins and Super Admins can manage general choir information here, such as creating new choir entries,
            updating descriptions, or assigning choir administrators. Choir-specific member and event management
            is handled by Choir Admins in their dedicated section.
          </p>
          {/* Placeholder for ChoirInfoForm and ChoirInfoList */}
        </CardContent>
      </Card>
    </div>
  );
}

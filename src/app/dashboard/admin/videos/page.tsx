
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// TODO: Implement actual video management form and list
// For now, this is a placeholder page

export default function AdminVideosPage() {
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
        <PageTitle title="Manage Videos" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Manage Videos"
        subtitle="Upload, organize, and manage videos in the gallery."
      />
      <Card>
        <CardHeader>
          <CardTitle>Video Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Video management functionality will be implemented here. Admins will be able to upload new videos,
            add titles, descriptions, categories, and manage existing video entries.
          </p>
          {/* Placeholder for VideoForm and VideoList */}
        </CardContent>
      </Card>
    </div>
  );
}

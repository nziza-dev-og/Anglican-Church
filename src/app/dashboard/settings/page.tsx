
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_ROLES } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
// TODO: Implement actual application settings.
// For now, this is a placeholder page for Super Admins.

export default function AppSettingsPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && userProfile && userProfile.role !== USER_ROLES.SUPER_ADMIN) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title="Application Settings" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Application Settings"
        subtitle="Manage global settings for Rubavu Anglican Connect."
      />
      <Card>
        <CardHeader>
          <CardTitle>Global Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This area is for Super Admins to manage application-wide settings. This could include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Site branding and appearance.</li>
            <li>Integration settings (e.g., email services).</li>
            <li>Default role assignments or secret code management.</li>
            <li>Feature flags or advanced configurations.</li>
          </ul>
          {/* Placeholder for actual settings controls */}
        </CardContent>
      </Card>
    </div>
  );
}

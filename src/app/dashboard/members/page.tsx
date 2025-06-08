
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { USERS_COLLECTION, USER_ROLES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Users } from "lucide-react";

export default function ViewMembersPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const authorizedRoles = useMemo(() => [
    USER_ROLES.CHIEF_PASTOR,
    USER_ROLES.PASTOR,
    USER_ROLES.DIACON,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.CHURCH_ADMIN
  ], []);

  const fetchUsers = useCallback(async () => {
    setLoadingData(true);
    try {
      const usersQuery = query(collection(db, USERS_COLLECTION), orderBy("displayName", "asc"));
      const querySnapshot = await getDocs(usersQuery);
      const fetchedUsers: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push({ uid: doc.id, ...doc.data() } as UserProfile);
      });
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: t('general.error.title'), description: t('admin.users.toast.error.fetch'), variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (authLoading) {
      setLoadingData(true);
      return;
    }

    if (!userProfile) {
      setLoadingData(false);
      // router.push('/auth/login'); // Or rely on AuthContext/DashboardLayout
      return;
    }
    
    const isAuthorized = authorizedRoles.includes(userProfile.role);

    if (!isAuthorized) {
      router.push("/dashboard");
      setLoadingData(false);
      return;
    }
    
    fetchUsers();

  }, [authLoading, userProfile, router, authorizedRoles, fetchUsers]);


  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (authLoading && loadingData) {
    return (
      <div>
        <PageTitle title={t('dashboard.members.pageTitle')} />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={t('dashboard.members.pageTitle')}
        subtitle={t('dashboard.members.pageSubtitle')}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.members.listTitle')}</CardTitle>
          <CardDescription>{t('dashboard.members.total')} {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingData ? (
             <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('dashboard.members.empty.title')}</h3>
              <p className="text-muted-foreground">{t('dashboard.members.empty.description')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.users.table.user')}</TableHead>
                  <TableHead>{t('admin.users.table.email')}</TableHead>
                  <TableHead>{t('admin.users.table.role')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.displayName || t('general.notAvailableShort')}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        <Badge variant={user.role === USER_ROLES.SUPER_ADMIN ? "destructive" : "secondary"}>
                           {t(`userRoles.${user.role.toLowerCase().replace(/\s+/g, '')}`)}
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

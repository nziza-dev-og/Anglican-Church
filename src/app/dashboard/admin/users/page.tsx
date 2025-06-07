
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { USERS_COLLECTION, USER_ROLES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/types";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_USER_ROLES_LIST } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminUsersPage() {
  const { userProfile: currentUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && currentUserProfile &&
        (currentUserProfile.role !== USER_ROLES.CHURCH_ADMIN && currentUserProfile.role !== USER_ROLES.SUPER_ADMIN)) {
      router.push("/dashboard");
    }
  }, [currentUserProfile, authLoading, router]);

  const fetchUsers = async () => {
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
  };

  useEffect(() => {
    if (currentUserProfile && (currentUserProfile.role === USER_ROLES.CHURCH_ADMIN || currentUserProfile.role === USER_ROLES.SUPER_ADMIN)) {
      fetchUsers();
    }
  }, [currentUserProfile]);
  
  const handleRoleChange = async (userId: string, newRole: UserProfile["role"]) => {
    if (currentUserProfile?.role !== USER_ROLES.SUPER_ADMIN && newRole === USER_ROLES.SUPER_ADMIN) {
        toast({ title: t('general.failure'), description: t('admin.users.permissionDeniedAssignSuperAdmin'), variant: "destructive" });
        return;
    }
    if (userId === currentUserProfile?.uid && newRole !== currentUserProfile?.role) {
        toast({ title: t('general.failure'), description: t('admin.users.cannotChangeOwnRole'), variant: "destructive" });
        setTimeout(fetchUsers, 100); 
        return;
    }

    try {
      const userDocRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userDocRef, { role: newRole });
      setUsers(prevUsers => prevUsers.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      toast({ title: t('admin.users.toast.roleUpdated.title'), description: `${t('admin.users.toast.roleUpdated.description')} ${t(`userRoles.${newRole.toLowerCase().replace(/\s+/g, '')}`)}.` });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({ title: t('general.error.title'), description: t('admin.users.toast.error.updateRole'), variant: "destructive" });
      setTimeout(fetchUsers, 100); 
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };


  if (authLoading || (!currentUserProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title={t('admin.users.pageTitle')} />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  return (
    <div>
      <PageTitle
        title={t('admin.users.pageTitle')}
        subtitle={t('admin.users.pageSubtitle')}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users.listTitle')}</CardTitle>
          <CardDescription>{t('admin.users.total')} {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <Skeleton className="h-64 w-full" />
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">{t('admin.users.empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.users.table.user')}</TableHead>
                  <TableHead>{t('admin.users.table.email')}</TableHead>
                  <TableHead>{t('admin.users.table.role')}</TableHead>
                  <TableHead className="text-right">{t('admin.users.table.actions')}</TableHead>
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
                    <TableCell className="text-right">
                      {currentUserProfile?.uid !== user.uid ? ( 
                         <Select
                            value={user.role}
                            onValueChange={(newRole) => handleRoleChange(user.uid, newRole as UserProfile["role"])}
                            disabled={currentUserProfile?.role !== USER_ROLES.SUPER_ADMIN && user.role === USER_ROLES.SUPER_ADMIN}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('admin.users.changeRolePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                            {ALL_USER_ROLES_LIST.map(roleOption => (
                                <SelectItem 
                                    key={roleOption} 
                                    value={roleOption}
                                    disabled={currentUserProfile?.role !== USER_ROLES.SUPER_ADMIN && roleOption === USER_ROLES.SUPER_ADMIN}
                                >
                                {t(`userRoles.${roleOption.toLowerCase().replace(/\s+/g, '')}`)}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">{t('admin.users.yourAccount')}</span>
                      )}
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

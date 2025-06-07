
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AdminUsersPage() {
  const { userProfile: currentUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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
      toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
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
        toast({ title: "Permission Denied", description: "Only Super Admins can assign Super Admin role.", variant: "destructive" });
        return;
    }
    if (userId === currentUserProfile?.uid && newRole !== currentUserProfile?.role) {
        toast({ title: "Action Denied", description: "You cannot change your own role.", variant: "destructive" });
        // Re-fetch to revert optimistic UI or force reload select
        setTimeout(fetchUsers, 100); // Re-fetch to revert select if needed
        return;
    }

    try {
      const userDocRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userDocRef, { role: newRole });
      setUsers(prevUsers => prevUsers.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      toast({ title: "Role Updated", description: `User role changed to ${newRole}.` });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({ title: "Error", description: "Could not update user role.", variant: "destructive" });
      setTimeout(fetchUsers, 100); // Re-fetch to revert select if needed
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };


  if (authLoading || (!currentUserProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title="Manage Users" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  return (
    <div>
      <PageTitle
        title="Manage Users"
        subtitle="View and manage user roles within the application."
      />
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>Total Users: {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <Skeleton className="h-64 w-full" />
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        <span className="font-medium">{user.displayName || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        <Badge variant={user.role === USER_ROLES.SUPER_ADMIN ? "destructive" : "secondary"}>
                            {user.role}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {currentUserProfile?.uid !== user.uid ? ( // Prevent changing own role directly in select
                         <Select
                            value={user.role}
                            onValueChange={(newRole) => handleRoleChange(user.uid, newRole as UserProfile["role"])}
                            disabled={currentUserProfile?.role !== USER_ROLES.SUPER_ADMIN && user.role === USER_ROLES.SUPER_ADMIN} // Church admin cannot change super admin
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Change role" />
                            </SelectTrigger>
                            <SelectContent>
                            {ALL_USER_ROLES_LIST.map(roleOption => (
                                <SelectItem 
                                    key={roleOption} 
                                    value={roleOption}
                                    disabled={currentUserProfile?.role !== USER_ROLES.SUPER_ADMIN && roleOption === USER_ROLES.SUPER_ADMIN}
                                >
                                {roleOption}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Your Account</span>
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


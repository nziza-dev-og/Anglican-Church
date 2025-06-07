
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UNIONS_COLLECTION, USER_ROLES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { ChurchUnion } from "@/types";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { Handshake, PlusCircle, Trash2, Edit, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import UnionInfoForm from "@/components/admin/UnionInfoForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";


export default function AdminUnionsPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [unions, setUnions] = useState<ChurchUnion[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUnion, setEditingUnion] = useState<ChurchUnion | null>(null);

  useEffect(() => {
    if (!authLoading && userProfile &&
        (userProfile.role !== USER_ROLES.CHURCH_ADMIN && userProfile.role !== USER_ROLES.SUPER_ADMIN)) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  const fetchUnions = async () => {
    setLoadingData(true);
    try {
      const unionsQuery = query(collection(db, UNIONS_COLLECTION), orderBy("name", "asc"));
      const querySnapshot = await getDocs(unionsQuery);
      const fetchedUnions: ChurchUnion[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUnions.push({ id: doc.id, ...doc.data() } as ChurchUnion);
      });
      setUnions(fetchedUnions);
    } catch (error) {
      console.error("Error fetching unions:", error);
      toast({ title: "Error", description: "Could not fetch unions.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (userProfile && (userProfile.role === USER_ROLES.CHURCH_ADMIN || userProfile.role === USER_ROLES.SUPER_ADMIN)) {
      fetchUnions();
    }
  }, [userProfile]);

  const handleUnionSaved = (savedUnion: ChurchUnion) => {
    if (editingUnion) {
      setUnions(prev => prev.map(u => u.id === savedUnion.id ? savedUnion : u));
    } else {
      setUnions(prev => [savedUnion, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
    }
    setShowForm(false);
    setEditingUnion(null);
  };
  
  const handleEditUnion = (union: ChurchUnion) => {
    setEditingUnion(union);
    setShowForm(true);
  };

  const handleDeleteUnion = async (unionId: string, unionName: string) => {
    try {
      await deleteDoc(doc(db, UNIONS_COLLECTION, unionId));
      setUnions(prev => prev.filter(u => u.id !== unionId));
      toast({ title: "Union Deleted", description: `"${unionName}" has been removed.` });
    } catch (error) {
      console.error("Error deleting union:", error);
      toast({ title: "Error", description: "Could not delete union.", variant: "destructive"});
    }
  };
  
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      setEditingUnion(null);
    }
  };

  if (authLoading || (!userProfile && !authLoading)) {
    return ( <div> <PageTitle title="Manage Unions" /> <Skeleton className="h-12 w-32 mb-6" /> <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)} </div> </div> );
  }

  return (
    <div>
      <PageTitle
        title="Manage Unions"
        subtitle="Update general information about church unions."
        actions={ <Button onClick={toggleForm} className="btn-animated"> <PlusCircle className="mr-2 h-5 w-5" /> {showForm ? "Cancel" : "Add New Union"} </Button> }
      />

      {showForm && (
        <Card className="mb-8 card-animated">
          <CardHeader><CardTitle className="font-body">{editingUnion ? "Edit Union" : "Add New Union"}</CardTitle></CardHeader>
          <CardContent><UnionInfoForm onUnionSaved={handleUnionSaved} editingUnion={editingUnion} /></CardContent>
        </Card>
      )}

      {loadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="overflow-hidden"><Skeleton className="h-40 w-full" /><CardHeader><Skeleton className="h-5 w-3/4 mb-1" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-5/6" /></CardContent><CardFooter className="flex space-x-2"><Skeleton className="h-9 flex-1" /><Skeleton className="h-9 flex-1" /></CardFooter></Card>
          ))}
        </div>
      ) : unions.length === 0 && !showForm ? (
        <div className="text-center py-12"> <Handshake className="mx-auto h-16 w-16 text-muted-foreground mb-4" /> <h3 className="text-xl font-semibold text-foreground mb-2">No Unions Found</h3> <p className="text-muted-foreground">Click "Add New Union" to get started.</p> </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {unions.map((union) => (
            <Card key={union.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-headline text-xl text-primary">{union.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pb-3 text-sm">
                <p className="text-foreground/80 line-clamp-3 mb-2">{union.description || "No description."}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="mr-1 h-4 w-4" /> Admin UIDs: {union.adminUids.length > 0 ? union.adminUids.map(uid => <Badge key={uid} variant="secondary" className="mr-1 text-xs">{uid.substring(0,6)}...</Badge>) : 'None'}
                </div>
              </CardContent>
              <CardFooter className="flex w-full space-x-2 !pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditUnion(union)}> <Edit className="mr-2 h-4 w-4" /> Edit </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="flex-1"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button></AlertDialogTrigger>
                  <AlertDialogContent> <AlertDialogHeader> <AlertDialogTitle>Are you sure?</AlertDialogTitle> <AlertDialogDescription> This action cannot be undone. This will permanently delete the union "{union.name}". </AlertDialogDescription> </AlertDialogHeader> <AlertDialogFooter> <AlertDialogCancel>Cancel</AlertDialogCancel> <AlertDialogAction onClick={() => handleDeleteUnion(union.id!, union.name)}> Delete </AlertDialogAction> </AlertDialogFooter> </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

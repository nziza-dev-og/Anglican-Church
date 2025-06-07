
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CHOIRS_COLLECTION, USER_ROLES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Choir } from "@/types";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { Music, PlusCircle, Trash2, Edit, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ChoirInfoForm from "@/components/admin/ChoirInfoForm";
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


export default function AdminChoirsPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [choirs, setChoirs] = useState<Choir[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingChoir, setEditingChoir] = useState<Choir | null>(null);

  useEffect(() => {
    if (!authLoading && userProfile &&
        (userProfile.role !== USER_ROLES.CHURCH_ADMIN && userProfile.role !== USER_ROLES.SUPER_ADMIN)) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  const fetchChoirs = async () => {
    setLoadingData(true);
    try {
      const choirsQuery = query(collection(db, CHOIRS_COLLECTION), orderBy("name", "asc"));
      const querySnapshot = await getDocs(choirsQuery);
      const fetchedChoirs: Choir[] = [];
      querySnapshot.forEach((doc) => {
        fetchedChoirs.push({ id: doc.id, ...doc.data() } as Choir);
      });
      setChoirs(fetchedChoirs);
    } catch (error) {
      console.error("Error fetching choirs:", error);
      toast({ title: "Error", description: "Could not fetch choirs.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (userProfile && (userProfile.role === USER_ROLES.CHURCH_ADMIN || userProfile.role === USER_ROLES.SUPER_ADMIN)) {
      fetchChoirs();
    }
  }, [userProfile]);

  const handleChoirSaved = (savedChoir: Choir) => {
    if (editingChoir) {
      setChoirs(prev => prev.map(c => c.id === savedChoir.id ? savedChoir : c));
    } else {
      setChoirs(prev => [savedChoir, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
    }
    setShowForm(false);
    setEditingChoir(null);
  };
  
  const handleEditChoir = (choir: Choir) => {
    setEditingChoir(choir);
    setShowForm(true);
  };

  const handleDeleteChoir = async (choirId: string, choirName: string) => {
    try {
      await deleteDoc(doc(db, CHOIRS_COLLECTION, choirId));
      setChoirs(prev => prev.filter(c => c.id !== choirId));
      toast({ title: "Choir Deleted", description: `"${choirName}" has been removed.` });
    } catch (error) {
      console.error("Error deleting choir:", error);
      toast({ title: "Error", description: "Could not delete choir.", variant: "destructive"});
    }
  };
  
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      setEditingChoir(null);
    }
  };

  if (authLoading || (!userProfile && !authLoading)) {
    return ( <div> <PageTitle title="Manage Choirs" /> <Skeleton className="h-12 w-32 mb-6" /> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)} </div> </div> );
  }

  return (
    <div>
      <PageTitle
        title="Manage Choirs"
        subtitle="Update general information about church choirs."
        actions={ <Button onClick={toggleForm} className="btn-animated"> <PlusCircle className="mr-2 h-5 w-5" /> {showForm ? "Cancel" : "Add New Choir"} </Button> }
      />

      {showForm && (
        <Card className="mb-8 card-animated">
          <CardHeader><CardTitle className="font-body">{editingChoir ? "Edit Choir" : "Add New Choir"}</CardTitle></CardHeader>
          <CardContent><ChoirInfoForm onChoirSaved={handleChoirSaved} editingChoir={editingChoir} /></CardContent>
        </Card>
      )}

      {loadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden"><Skeleton className="h-40 w-full" /><CardHeader><Skeleton className="h-5 w-3/4 mb-1" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-5/6" /></CardContent><CardFooter className="flex space-x-2"><Skeleton className="h-9 flex-1" /><Skeleton className="h-9 flex-1" /></CardFooter></Card>
          ))}
        </div>
      ) : choirs.length === 0 && !showForm ? (
        <div className="text-center py-12"> <Music className="mx-auto h-16 w-16 text-muted-foreground mb-4" /> <h3 className="text-xl font-semibold text-foreground mb-2">No Choirs Found</h3> <p className="text-muted-foreground">Click "Add New Choir" to get started.</p> </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {choirs.map((choir) => (
            <Card key={choir.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-headline text-xl text-primary">{choir.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Chamber: {choir.chamber}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pb-3 text-sm">
                <p className="text-foreground/80 line-clamp-3 mb-2">{choir.description || "No description."}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="mr-1 h-4 w-4" /> Admin UIDs: {choir.adminUids.length > 0 ? choir.adminUids.map(uid => <Badge key={uid} variant="secondary" className="mr-1 text-xs">{uid.substring(0,6)}...</Badge>) : 'None'}
                </div>
              </CardContent>
              <CardFooter className="flex w-full space-x-2 !pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditChoir(choir)}> <Edit className="mr-2 h-4 w-4" /> Edit </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="flex-1"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button></AlertDialogTrigger>
                  <AlertDialogContent> <AlertDialogHeader> <AlertDialogTitle>Are you sure?</AlertDialogTitle> <AlertDialogDescription> This action cannot be undone. This will permanently delete the choir "{choir.name}". </AlertDialogDescription> </AlertDialogHeader> <AlertDialogFooter> <AlertDialogCancel>Cancel</AlertDialogCancel> <AlertDialogAction onClick={() => handleDeleteChoir(choir.id!, choir.name)}> Delete </AlertDialogAction> </AlertDialogFooter> </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

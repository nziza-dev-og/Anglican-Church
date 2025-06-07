
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CEREMONIES_COLLECTION, USER_ROLES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Ceremony } from "@/types";
import { collection, getDocs, query, orderBy, Timestamp, doc, deleteDoc } from "firebase/firestore";
import { CalendarDays, PlusCircle, Trash2, Edit, ShieldCheck, Image as ImageIcon, Video } from "lucide-react";
import Image from "next/image"; 
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import CeremonyForm from "@/components/admin/CeremonyForm";
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
import { useTranslation } from "@/hooks/useTranslation";

const formatDate = (timestamp: Timestamp | Date) => {
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); // Consider making locale dynamic
};

export default function AdminCeremoniesPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [ceremonies, setCeremonies] = useState<Ceremony[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCeremony, setEditingCeremony] = useState<Ceremony | null>(null);

  useEffect(() => {
    if (!authLoading && userProfile &&
        (userProfile.role !== USER_ROLES.CHURCH_ADMIN && userProfile.role !== USER_ROLES.SUPER_ADMIN)) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  const fetchCeremonies = async () => {
    setLoadingData(true);
    try {
      const ceremoniesQuery = query(collection(db, CEREMONIES_COLLECTION), orderBy("date", "desc"));
      const querySnapshot = await getDocs(ceremoniesQuery);
      const fetchedCeremonies: Ceremony[] = [];
      querySnapshot.forEach((doc) => {
        fetchedCeremonies.push({ id: doc.id, ...doc.data() } as Ceremony);
      });
      setCeremonies(fetchedCeremonies);
    } catch (error) {
      console.error("Error fetching ceremonies:", error);
      toast({ title: t('general.error.title'), description: t('admin.ceremonies.toast.error.fetch'), variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (userProfile && (userProfile.role === USER_ROLES.CHURCH_ADMIN || userProfile.role === USER_ROLES.SUPER_ADMIN)) {
      fetchCeremonies();
    }
  }, [userProfile, t, toast]); // Added t and toast

  const handleCeremonySaved = (savedCeremony: Ceremony) => {
    if (editingCeremony) {
      setCeremonies(prev => prev.map(c => c.id === savedCeremony.id ? savedCeremony : c).sort((a,b) => (b.date as Timestamp).toMillis() - (a.date as Timestamp).toMillis()));
    } else {
      setCeremonies(prev => [savedCeremony, ...prev].sort((a,b) => (b.date as Timestamp).toMillis() - (a.date as Timestamp).toMillis()));
    }
    setShowForm(false);
    setEditingCeremony(null);
  };
  
  const handleEditCeremony = (ceremony: Ceremony) => {
    setEditingCeremony(ceremony);
    setShowForm(true);
  };

  const handleDeleteCeremony = async (ceremonyId: string, ceremonyTitle: string) => {
    try {
      await deleteDoc(doc(db, CEREMONIES_COLLECTION, ceremonyId));
      setCeremonies(prev => prev.filter(c => c.id !== ceremonyId));
      toast({ title: t('admin.ceremonies.toast.deleted.title'), description: `"${ceremonyTitle}" ${t('admin.ceremonies.toast.deleted.description')}` });
    } catch (error) {
      console.error("Error deleting ceremony:", error);
      toast({ title: t('general.error.title'), description: t('admin.ceremonies.toast.error.delete'), variant: "destructive"});
    }
  };
  
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      setEditingCeremony(null);
    }
  };

  if (authLoading || (!userProfile && !authLoading)) {
    return ( <div> <PageTitle title={t('admin.ceremonies.pageTitle')} /> <Skeleton className="h-12 w-32 mb-6" /> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)} </div> </div> );
  }

  return (
    <div>
      <PageTitle
        title={t('admin.ceremonies.pageTitle')}
        subtitle={t('admin.ceremonies.pageSubtitle')}
        actions={ <Button onClick={toggleForm} className="btn-animated"> <PlusCircle className="mr-2 h-5 w-5" /> {showForm ? t('general.cancel') : t('admin.ceremonies.addNew')} </Button> }
      />

      {showForm && (
        <Card className="mb-8 card-animated">
          <CardHeader><CardTitle className="font-body">{editingCeremony ? t('admin.ceremonies.form.editTitle') : t('admin.ceremonies.form.addTitle')}</CardTitle></CardHeader>
          <CardContent><CeremonyForm onCeremonySaved={handleCeremonySaved} editingCeremony={editingCeremony} /></CardContent>
        </Card>
      )}

      {loadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden"><Skeleton className="aspect-video w-full" /><CardHeader><Skeleton className="h-5 w-3/4 mb-1" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-5/6" /></CardContent><CardFooter className="flex space-x-2"><Skeleton className="h-9 flex-1" /><Skeleton className="h-9 flex-1" /></CardFooter></Card>
          ))}
        </div>
      ) : ceremonies.length === 0 && !showForm ? (
        <div className="text-center py-12"> <ShieldCheck className="mx-auto h-16 w-16 text-muted-foreground mb-4" /> <h3 className="text-xl font-semibold text-foreground mb-2">{t('admin.ceremonies.empty.title')}</h3> <p className="text-muted-foreground">{t('admin.ceremonies.empty.description')}</p> </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ceremonies.map((ceremony) => (
            <Card key={ceremony.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg bg-card">
              {ceremony.imageUrls && ceremony.imageUrls.length > 0 ? (
                <div className="relative aspect-video w-full"> <Image src={ceremony.imageUrls[0]} alt={ceremony.title} layout="fill" objectFit="cover" data-ai-hint="ceremony image" /> </div>
              ) : (
                <div className="relative aspect-video w-full bg-secondary/30 flex items-center justify-center"><ImageIcon className="h-16 w-16 text-muted-foreground" /></div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="font-headline text-lg text-primary">{ceremony.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{t('general.type')} {ceremony.type}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pb-3 text-sm">
                <div className="flex items-center text-muted-foreground mb-1"><CalendarDays className="mr-2 h-4 w-4" />{formatDate(ceremony.date)}</div>
                <p className="text-foreground/80 line-clamp-2 mb-1">{ceremony.description || t('general.noDescription')}</p>
                {ceremony.videoUrls && ceremony.videoUrls.length > 0 && (
                  <div className="flex items-center text-xs text-muted-foreground"><Video className="mr-1 h-3 w-3" /> {ceremony.videoUrls.length} {t('admin.ceremonies.card.videosCount')}</div>
                )}
              </CardContent>
              <CardFooter className="flex w-full space-x-2 !pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditCeremony(ceremony)}> <Edit className="mr-2 h-4 w-4" /> {t('general.edit')} </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="flex-1"><Trash2 className="mr-2 h-4 w-4" /> {t('general.delete')}</Button></AlertDialogTrigger>
                  <AlertDialogContent> <AlertDialogHeader> <AlertDialogTitle>{t('general.confirmation.title')}</AlertDialogTitle> <AlertDialogDescription> {t('general.confirmation.cannotBeUndone')} {t('admin.ceremonies.delete.confirm.description')} "{ceremony.title}". </AlertDialogDescription> </AlertDialogHeader> <AlertDialogFooter> <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel> <AlertDialogAction onClick={() => handleDeleteCeremony(ceremony.id!, ceremony.title)}> {t('general.delete')} </AlertDialogAction> </AlertDialogFooter> </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

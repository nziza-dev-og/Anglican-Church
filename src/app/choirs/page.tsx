
"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CHOIRS_COLLECTION, CHOIR_MEMBERS_COLLECTION } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Choir, ChoirMember } from "@/types";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, where } from "firebase/firestore";
import { Music2, Users, CheckCircle, Hourglass, PlusCircle } from "lucide-react";
import Image from "next/image";
// import Link from "next/link"; // Keep if detail pages are re-introduced
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function ChoirsPage() {
  const [choirs, setChoirs] = useState<Choir[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userChoirMemberships, setUserChoirMemberships] = useState<ChoirMember[]>([]);
  const [requestingJoin, setRequestingJoin] = useState<string | null>(null); // Choir ID being requested

  useEffect(() => {
    const fetchChoirsAndMemberships = async () => {
      setLoading(true);
      try {
        const choirsQuery = query(collection(db, CHOIRS_COLLECTION), orderBy("name", "asc"));
        const querySnapshot = await getDocs(choirsQuery);
        const fetchedChoirs: Choir[] = [];
        querySnapshot.forEach((doc) => {
          fetchedChoirs.push({ id: doc.id, ...doc.data() } as Choir);
        });
        setChoirs(fetchedChoirs);

        if (user) {
          const memberQuery = query(collection(db, CHOIR_MEMBERS_COLLECTION), where("userId", "==", user.uid));
          const memberSnapshot = await getDocs(memberQuery);
          const fetchedMemberships: ChoirMember[] = [];
          memberSnapshot.forEach(doc => {
            fetchedMemberships.push({ id: doc.id, ...doc.data() } as ChoirMember);
          });
          setUserChoirMemberships(fetchedMemberships);
        }

      } catch (error) {
        console.error("Error fetching choirs:", error);
        toast({ title: t('general.error.title'), description: t('admin.choirs.toast.error.fetch'), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchChoirsAndMemberships();
  }, [user, t, toast]);

  const handleRequestToJoin = async (choirId: string, choirName: string) => {
    if (!user) {
      toast({ title: t('general.error.title'), description: t('general.error.mustBeLoggedIn'), variant: "destructive" });
      return;
    }
    setRequestingJoin(choirId);
    try {
      const newMembership: Omit<ChoirMember, 'id'> = {
        userId: user.uid,
        choirId: choirId,
        joinDate: serverTimestamp() as any, // Firestore will convert
        status: 'pending',
        roleInChoir: 'Applicant', // Default role for new requests
      };
      const docRef = await addDoc(collection(db, CHOIR_MEMBERS_COLLECTION), newMembership);
      setUserChoirMemberships(prev => [...prev, { ...newMembership, id: docRef.id, joinDate: new Date() } as ChoirMember]);
      toast({ title: t('choirs.joinRequest.success.title'), description: t('choirs.joinRequest.success.description', { choirName }) });
    } catch (error) {
      console.error("Error requesting to join choir:", error);
      toast({ title: t('general.error.title'), description: t('choirs.joinRequest.error.description'), variant: "destructive" });
    } finally {
      setRequestingJoin(null);
    }
  };

  const getMembershipStatus = (choirId: string): 'joined' | 'pending' | 'none' => {
    const membership = userChoirMemberships.find(m => m.choirId === choirId);
    if (!membership) return 'none';
    if (membership.status === 'approved') return 'joined';
    if (membership.status === 'pending') return 'pending';
    return 'none'; // Could also be 'rejected', but we don't show a specific state for that here
  };


  return (
    <AppLayout>
      <PageTitle
        title={t('choirs.title')}
        subtitle={t('choirs.subtitle')}
      />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden card-animated">
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
               <CardFooter><Skeleton className="h-9 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      ) : choirs.length === 0 ? (
        <div className="text-center py-12">
          <Music2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">{t('choirs.empty.title')}</h3>
          <p className="text-muted-foreground">{t('choirs.empty.description')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {choirs.map((choir) => {
            const status = user ? getMembershipStatus(choir.id!) : 'none';
            return (
              <Card key={choir.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg card-animated bg-card animate-slide-in-up">
                <div className="relative h-48 w-full bg-secondary/30 flex items-center justify-center">
                   <Image src="https://placehold.co/600x400.png" alt={choir.name} layout="fill" objectFit="cover" data-ai-hint="choir singing" />
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="font-headline text-2xl text-primary">{choir.name}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {t('choirs.card.chamber')} {choir.chamber || t('general.notAvailableShort')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-foreground/80 line-clamp-4 mb-2">
                    {choir.description || t('general.noDescription')}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {t('choirs.card.ledBy')}
                  </div>
                </CardContent>
                <CardFooter>
                  {user && (
                    status === 'none' ? (
                      <Button 
                        onClick={() => handleRequestToJoin(choir.id!, choir.name)} 
                        className="w-full btn-animated"
                        disabled={requestingJoin === choir.id}
                      >
                        {requestingJoin === choir.id ? <Hourglass className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        {requestingJoin === choir.id ? t('choirs.joinRequest.button.requesting') : t('choirs.joinRequest.button.request')}
                      </Button>
                    ) : status === 'pending' ? (
                      <Button className="w-full" variant="outline" disabled>
                        <Hourglass className="mr-2 h-4 w-4" />{t('choirs.joinRequest.button.pending')}
                      </Button>
                    ) : ( // status === 'joined'
                      <Button className="w-full" variant="outline" disabled>
                         <CheckCircle className="mr-2 h-4 w-4" />{t('choirs.joinRequest.button.joined')}
                      </Button>
                    )
                  )}
                  {!user && (
                     <Button className="w-full" variant="outline" disabled>{t('choirs.joinRequest.button.loginToRequest')}</Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

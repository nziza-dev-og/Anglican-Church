
"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CHOIRS_COLLECTION, UNIONS_COLLECTION, USERS_COLLECTION } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Choir, ChurchUnion, UserProfile, ProcessedLeader } from "@/types";
import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Users, ShieldCheck, Music, Handshake, Phone, Mail, Info } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function LeadershipPage() {
  const [leaders, setLeaders] = useState<ProcessedLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [selectedLeader, setSelectedLeader] = useState<ProcessedLeader | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchLeadershipData = async () => {
      setLoading(true);
      try {
        const choirsSnapshot = await getDocs(collection(db, CHOIRS_COLLECTION));
        const choirs = choirsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Choir));

        const unionsSnapshot = await getDocs(collection(db, UNIONS_COLLECTION));
        const unions = unionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChurchUnion));

        const adminUids = new Set<string>();
        choirs.forEach(choir => choir.adminUids.forEach(uid => adminUids.add(uid)));
        unions.forEach(union => union.adminUids.forEach(uid => adminUids.add(uid)));
        
        const uniqueAdminUids = Array.from(adminUids);

        if (uniqueAdminUids.length === 0) {
          setLeaders([]);
          setLoading(false);
          return;
        }
        
        // Firestore 'in' query has a limit of 30 items per query.
        // If more than 30 admins, batch the queries.
        const adminProfiles: UserProfile[] = [];
        const CHUNK_SIZE = 30;
        for (let i = 0; i < uniqueAdminUids.length; i += CHUNK_SIZE) {
            const chunkUids = uniqueAdminUids.slice(i, i + CHUNK_SIZE);
            if (chunkUids.length > 0) {
                const usersQuery = query(collection(db, USERS_COLLECTION), where(documentId(), "in", chunkUids));
                const usersSnapshot = await getDocs(usersQuery);
                usersSnapshot.forEach(doc => adminProfiles.push({ uid: doc.id, ...doc.data() } as UserProfile));
            }
        }


        const processedLeaders: ProcessedLeader[] = adminProfiles.map(profile => {
          const managedChoirs = choirs.filter(choir => choir.adminUids.includes(profile.uid)).map(c => ({id: c.id!, name: c.name}));
          const managedUnions = unions.filter(union => union.adminUids.includes(profile.uid)).map(u => ({id: u.id!, name: u.name}));
          return {
            ...profile,
            managedChoirs,
            managedUnions,
          };
        });
        
        processedLeaders.sort((a,b) => (a.displayName || "").localeCompare(b.displayName || ""));
        setLeaders(processedLeaders);

      } catch (error) {
        console.error("Error fetching leadership data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadershipData();
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  const handleViewDetails = (leader: ProcessedLeader) => {
    setSelectedLeader(leader);
    setIsDetailModalOpen(true);
  };

  return (
    <AppLayout>
      <PageTitle
        title={t('leadership.page.title')}
        subtitle={t('leadership.page.subtitle')}
      />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-12">
          <ShieldCheck className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">{t('leadership.page.empty.title')}</h3>
          <p className="text-muted-foreground">{t('leadership.page.empty.description')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {leaders.map((leader) => (
            <Card key={leader.uid} className="flex flex-col overflow-hidden shadow-lg rounded-lg card-animated bg-card">
              <CardHeader className="flex flex-row items-center gap-4 pb-3">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={leader.photoURL || undefined} alt={leader.displayName || 'Leader'} />
                  <AvatarFallback>{getInitials(leader.displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="font-headline text-xl text-primary">{leader.displayName || t('general.anonymousUser')}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">{t(`userRoles.${leader.role.toLowerCase().replace(/\s+/g, '')}`)}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm">
                {leader.managedChoirs.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center"><Music className="mr-2 h-4 w-4 text-accent" />{t('leadership.page.managesChoirs')}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {leader.managedChoirs.map(choir => <Badge key={choir.id} variant="secondary">{choir.name}</Badge>)}
                    </div>
                  </div>
                )}
                {leader.managedUnions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center"><Handshake className="mr-2 h-4 w-4 text-accent" />{t('leadership.page.managesUnions')}</h4>
                     <div className="flex flex-wrap gap-1 mt-1">
                        {leader.managedUnions.map(union => <Badge key={union.id} variant="secondary">{union.name}</Badge>)}
                    </div>
                  </div>
                )}
                {(leader.managedChoirs.length === 0 && leader.managedUnions.length === 0) && (
                    <p className="text-xs text-muted-foreground italic">{t('leadership.page.noGroupsManaged')}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleViewDetails(leader)} className="w-full btn-animated" variant="outline">
                  <Info className="mr-2 h-4 w-4" /> {t('general.viewDetails')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedLeader && (
        <Dialog open={isDetailModalOpen} onOpenChange={(open) => {setIsDetailModalOpen(open); if(!open) setSelectedLeader(null);}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="items-center">
              <Avatar className="h-24 w-24 border-2 border-primary mb-3">
                <AvatarImage src={selectedLeader.photoURL || undefined} alt={selectedLeader.displayName || 'Leader'} />
                <AvatarFallback className="text-3xl">{getInitials(selectedLeader.displayName)}</AvatarFallback>
              </Avatar>
              <DialogTitle className="text-2xl font-headline">{selectedLeader.displayName}</DialogTitle>
              <DialogDescription>{t(`userRoles.${selectedLeader.role.toLowerCase().replace(/\s+/g, '')}`)}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3 text-sm">
              <div className="flex items-center">
                <Mail className="mr-3 h-5 w-5 text-muted-foreground" />
                <a href={`mailto:${selectedLeader.email}`} className="text-primary hover:underline">{selectedLeader.email}</a>
              </div>
              {selectedLeader.phoneNumber && (
                <div className="flex items-center">
                  <Phone className="mr-3 h-5 w-5 text-muted-foreground" />
                  <span>{selectedLeader.phoneNumber}</span>
                </div>
              )}
              {selectedLeader.managedChoirs.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground flex items-center mt-2 mb-1"><Music className="mr-2 h-4 w-4 text-accent" />{t('leadership.page.managesChoirs')}</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedLeader.managedChoirs.map(choir => <Badge key={choir.id} variant="outline">{choir.name}</Badge>)}
                    </div>
                  </div>
                )}
                {selectedLeader.managedUnions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground flex items-center mt-2 mb-1"><Handshake className="mr-2 h-4 w-4 text-accent" />{t('leadership.page.managesUnions')}</h4>
                     <div className="flex flex-wrap gap-1">
                        {selectedLeader.managedUnions.map(union => <Badge key={union.id} variant="outline">{union.name}</Badge>)}
                    </div>
                  </div>
                )}
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                {t('general.cancel')} 
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}

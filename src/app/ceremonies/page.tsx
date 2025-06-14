
"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CEREMONIES_COLLECTION } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Ceremony } from "@/types";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { CalendarDays, Camera, Church } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const formatDate = (timestamp: Timestamp | Date) => {
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString('en-US', { // Consider making locale dynamic
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function CeremoniesPage() {
  const [ceremonies, setCeremonies] = useState<Ceremony[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchCeremonies = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchCeremonies();
  }, []);

  return (
    <AppLayout>
      <PageTitle
        title={t('ceremonies.title')}
        subtitle={t('ceremonies.subtitle')}
      />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden card-animated">
              <Skeleton className="aspect-video w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : ceremonies.length === 0 ? (
        <div className="text-center py-12">
          <Church className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">{t('ceremonies.empty.title')}</h3>
          <p className="text-muted-foreground">{t('ceremonies.empty.description')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ceremonies.map((ceremony) => (
            <Card key={ceremony.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg card-animated bg-card animate-slide-in-up">
              {ceremony.imageUrls && ceremony.imageUrls.length > 0 && (
                <div className="relative aspect-video w-full">
                  <Image
                    src={ceremony.imageUrls[0]}
                    alt={ceremony.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="ceremony event"
                  />
                </div>
              )}
               {!ceremony.imageUrls || ceremony.imageUrls.length === 0 && (
                 <div className="relative aspect-video w-full bg-secondary/30 flex items-center justify-center">
                    <Camera className="h-16 w-16 text-muted-foreground" />
                 </div>
               )}
              <CardHeader className="pb-2">
                <CardTitle className="font-headline text-xl text-primary">{ceremony.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{t('ceremonies.card.type')} {ceremony.type}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow pb-3">
                 <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {formatDate(ceremony.date)}
                </div>
                <p className="text-foreground/80 line-clamp-3">
                  {ceremony.description || t('ceremonies.card.noDetails')}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full btn-animated" variant="outline">
                  <Link href={`/ceremonies/${ceremony.id}`}>{t('general.viewDetails')}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

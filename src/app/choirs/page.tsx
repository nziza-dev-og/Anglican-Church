
"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CHOIRS_COLLECTION } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Choir } from "@/types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Music2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ChoirsPage() {
  const [choirs, setChoirs] = useState<Choir[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchChoirs = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchChoirs();
  }, []);

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
          {choirs.map((choir) => (
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
              {/* Add Link to choir details page if one exists in future */}
              {/* <CardFooter>
                <Button asChild variant="link" className="text-primary p-0 hover:text-accent">
                  <Link href={`/choirs/${choir.id}`}>{t('general.learnMore')}</Link>
                </Button>
              </CardFooter> */}
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

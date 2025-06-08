
"use client";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CEREMONIES_COLLECTION } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Ceremony } from "@/types";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { ArrowLeft, CalendarDays, FileText, Info, Image as ImageIcon, Video as VideoIcon, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const formatDate = (timestamp: Timestamp | Date) => {
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function CeremonyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ceremonyId = params.id as string;
  const { t } = useTranslation();

  const [ceremony, setCeremony] = useState<Ceremony | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ceremonyId) {
      const fetchCeremony = async () => {
        setLoading(true);
        setError(null);
        // setCeremony(null); // Clear previous ceremony data before fetching new one
        try {
          const ceremonyDocRef = doc(db, CEREMONIES_COLLECTION, ceremonyId);
          const docSnap = await getDoc(ceremonyDocRef);
          if (docSnap.exists()) {
            setCeremony({ id: docSnap.id, ...docSnap.data() } as Ceremony);
          } else {
            setError(t('ceremonyDetail.notFound'));
            setCeremony(null); // Ensure ceremony is null if not found
          }
        } catch (err) {
          console.error("Error fetching ceremony:", err);
          setError(t('ceremonyDetail.failToLoad'));
          setCeremony(null); // Ensure ceremony is null on error
        } finally {
          setLoading(false);
        }
      };
      fetchCeremony();
    } else {
      // Handle case where ceremonyId is not available (e.g., during initial render or if params are weird)
      setLoading(false);
      setError(t('ceremonyDetail.failToLoad')); 
      setCeremony(null);
    }
  }, [ceremonyId, t]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" /> {/* Title */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Skeleton className="h-5 w-1/2" /> {/* Date */}
            <Skeleton className="h-5 w-1/3" /> {/* Type */}
          </div>
          <Skeleton className="h-20 w-full mb-6" /> {/* Description */}
          <Skeleton className="h-8 w-1/4 mb-3" /> {/* Images section title */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="aspect-square w-full rounded-lg" />)}
          </div>
          <Skeleton className="h-8 w-1/4 mb-3" /> {/* Videos section title */}
          <Skeleton className="h-48 w-full rounded-lg" /> {/* Video placeholder */}
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto text-center py-10">
          <Info className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold text-destructive mb-2">{error}</h2>
          <p className="text-muted-foreground mb-6">{t('ceremonyDetail.notFound.description')}</p>
          <Button onClick={() => router.push('/ceremonies')} className="btn-animated">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('ceremonyDetail.backButton')}
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!ceremony) {
    // This state can be reached if !loading && !error but ceremony is still null.
    // This might happen if ceremonyId was initially undefined.
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto text-center py-10">
          <p className="text-muted-foreground">{t('ceremonyDetail.unavailable')}</p>
           <Button onClick={() => router.push('/ceremonies')} className="btn-animated mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('ceremonyDetail.backButton')}
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.push('/ceremonies')} className="mb-6 btn-animated">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('ceremonyDetail.backButton')}
        </Button>

        <Card className="card-animated mb-8">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-headline text-primary">{ceremony.title}</CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-muted-foreground mt-2">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-accent" />
                <span>{formatDate(ceremony.date)}</span>
              </div>
              <div className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-accent" />
                <span>{t('ceremonies.card.type')} {ceremony.type}</span>
              </div>
            </div>
          </CardHeader>
          {ceremony.description && (
            <CardContent>
              <CardDescription className="text-base text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {ceremony.description}
              </CardDescription>
            </CardContent>
          )}
        </Card>

        {ceremony.imageUrls && ceremony.imageUrls.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-headline font-semibold text-primary mb-4 flex items-center">
              <ImageIcon className="mr-3 h-6 w-6 text-accent" />
              {t('ceremonyDetail.imagesTitle')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ceremony.imageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square w-full rounded-lg overflow-hidden shadow-md card-animated">
                  <Image src={url} alt={`${ceremony.title} - Image ${index + 1}`} layout="fill" objectFit="cover" data-ai-hint="ceremony photo"/>
                </div>
              ))}
            </div>
          </section>
        )}

        {ceremony.videoUrls && ceremony.videoUrls.length > 0 && (
          <section>
            <h2 className="text-2xl font-headline font-semibold text-primary mb-4 flex items-center">
              <VideoIcon className="mr-3 h-6 w-6 text-accent" />
              {t('ceremonyDetail.videosTitle')}
            </h2>
            <div className="space-y-6">
              {ceremony.videoUrls.map((url, index) => {
                const youtubeVideoId = getYouTubeVideoId(url);
                return (
                  <div key={index} className="card-animated">
                    {youtubeVideoId ? (
                      <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                          title={`${ceremony.title} - Video ${index + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg bg-card">
                        <Link href={url} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                          <LinkIcon className="mr-2 h-5 w-5"/>
                          {t('ceremonyDetail.watchVideoLink')} {index + 1}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{url}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {(ceremony.imageUrls?.length === 0 || !ceremony.imageUrls) && (ceremony.videoUrls?.length === 0 || !ceremony.videoUrls) && (
             <p className="text-center text-muted-foreground py-8">{t('ceremonyDetail.noMedia')}</p>
        )}
      </div>
    </AppLayout>
  );
}

    
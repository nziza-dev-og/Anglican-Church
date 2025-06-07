
"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VIDEOS_COLLECTION } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Video } from "@/types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { PlayCircle, VideoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const videosQuery = query(collection(db, VIDEOS_COLLECTION), orderBy("uploadedAt", "desc"));
        const querySnapshot = await getDocs(videosQuery);
        const fetchedVideos: Video[] = [];
        querySnapshot.forEach((doc) => {
          fetchedVideos.push({ id: doc.id, ...doc.data() } as Video);
        });
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  return (
    <AppLayout>
      <PageTitle
        title={t('videos.title')}
        subtitle={t('videos.subtitle')}
      />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden card-animated">
              <Skeleton className="aspect-video w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
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
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <VideoIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">{t('videos.empty.title')}</h3>
          <p className="text-muted-foreground">{t('videos.empty.description')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <Card key={video.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg card-animated bg-card animate-slide-in-up">
              <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video w-full group">
                <Image
                  src={video.thumbnailUrl || "https://placehold.co/600x338.png"}
                  alt={t('videos.card.thumbnailAlt')}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="video thumbnail"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-white/80 group-hover:text-white transition-transform group-hover:scale-110" />
                </div>
              </Link>
              <CardHeader className="pb-2">
                <CardTitle className="font-body text-lg text-primary line-clamp-2">{video.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pb-3">
                <CardDescription className="text-sm text-foreground/80 line-clamp-3">
                  {video.description || t('general.noDescription')}
                </CardDescription>
              </CardContent>
               <CardFooter>
                <Button asChild className="w-full btn-animated" variant="outline">
                  <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                     {t('videos.card.watch')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

    
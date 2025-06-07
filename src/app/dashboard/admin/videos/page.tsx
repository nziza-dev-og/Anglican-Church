
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VIDEOS_COLLECTION, USER_ROLES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Video } from "@/types";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { PlayCircle, PlusCircle, Trash2, Edit, VideoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import VideoForm from "@/components/admin/VideoForm";
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

export default function AdminVideosPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (!authLoading && userProfile &&
        (userProfile.role !== USER_ROLES.CHURCH_ADMIN && userProfile.role !== USER_ROLES.SUPER_ADMIN)) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  const fetchVideos = async () => {
    setLoadingData(true);
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
      toast({ title: t('general.error.title'), description: t('admin.videos.toast.error.fetch'), variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (userProfile && (userProfile.role === USER_ROLES.CHURCH_ADMIN || userProfile.role === USER_ROLES.SUPER_ADMIN)) {
      fetchVideos();
    }
  }, [userProfile, t, toast]); 

  const handleVideoSaved = (savedVideo: Video) => {
    if (editingVideo) {
      setVideos(prevVideos => prevVideos.map(v => v.id === savedVideo.id ? savedVideo : v));
    } else {
      setVideos(prevVideos => [savedVideo, ...prevVideos]);
    }
    setShowForm(false);
    setEditingVideo(null);
  };
  
  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    try {
      await deleteDoc(doc(db, VIDEOS_COLLECTION, videoId));
      setVideos(prevVideos => prevVideos.filter(v => v.id !== videoId));
      toast({ title: t('admin.videos.toast.deleted.title'), description: `"${videoTitle}" ${t('admin.videos.toast.deleted.description')}` });
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({ title: t('general.error.title'), description: t('admin.videos.toast.error.delete'), variant: "destructive"});
    }
  };
  
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) { 
      setEditingVideo(null);
    }
  };

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title={t('admin.videos.pageTitle')} />
        <Skeleton className="h-12 w-32 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={t('admin.videos.pageTitle')}
        subtitle={t('admin.videos.pageSubtitle')}
        actions={
          <Button onClick={toggleForm} className="btn-animated">
            <PlusCircle className="mr-2 h-5 w-5" /> {showForm ? t('general.cancel') : t('admin.videos.addNew')}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8 card-animated">
          <CardHeader>
            <CardTitle className="font-body">{editingVideo ? t('admin.videos.form.editTitle') : t('admin.videos.form.addTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoForm onVideoSaved={handleVideoSaved} editingVideo={editingVideo} />
          </CardContent>
        </Card>
      )}

      {loadingData ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden card-animated">
              <Skeleton className="aspect-video w-full" />
              <CardHeader><Skeleton className="h-5 w-3/4 mb-1" /><Skeleton className="h-4 w-1/2" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-5/6" /></CardContent>
              <CardFooter className="flex space-x-2"><Skeleton className="h-9 flex-1" /><Skeleton className="h-9 flex-1" /></CardFooter>
            </Card>
          ))}
        </div>
      ) : videos.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <VideoIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">{t('admin.videos.empty.title')}</h3>
          <p className="text-muted-foreground">{t('admin.videos.empty.description')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <Card key={video.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg bg-card">
              <Link href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video w-full group">
                <Image
                  src={video.thumbnailUrl || "https://placehold.co/600x338.png"}
                  alt={video.title}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="video thumbnail"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-white/80 group-hover:text-white transition-transform group-hover:scale-110" />
                </div>
              </Link>
              <CardHeader className="pt-4 pb-2">
                <CardTitle className="font-body text-base text-primary line-clamp-2">{video.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pb-1 text-xs">
                <p className="text-muted-foreground line-clamp-2">{t('admin.videos.card.category')} {video.category || t('general.notAvailableShort')}</p>
                <p className="text-muted-foreground line-clamp-2">
                    {t('admin.videos.card.url')} <Link href={video.videoUrl} target="_blank" className="hover:underline">{video.videoUrl}</Link>
                </p>
              </CardContent>
              <CardFooter className="flex w-full space-x-2 !pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditVideo(video)}>
                    <Edit className="mr-2 h-4 w-4" /> {t('general.edit')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" /> {t('general.delete')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('general.confirmation.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('general.confirmation.cannotBeUndone')} {t('admin.videos.delete.confirm.description')} "{video.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteVideo(video.id!, video.title)}>
                          {t('general.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

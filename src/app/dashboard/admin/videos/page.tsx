
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

export default function AdminVideosPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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
      toast({ title: "Error", description: "Could not fetch videos.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (userProfile && (userProfile.role === USER_ROLES.CHURCH_ADMIN || userProfile.role === USER_ROLES.SUPER_ADMIN)) {
      fetchVideos();
    }
  }, [userProfile]);

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
      toast({ title: "Video Deleted", description: `"${videoTitle}" has been removed.` });
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({ title: "Error", description: "Could not delete video.", variant: "destructive"});
    }
  };
  
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) { // If form was open and is now closing
      setEditingVideo(null); // Reset editing state
    }
  };

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title="Manage Videos" />
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
        title="Manage Videos"
        subtitle="Add, edit, or remove videos from the gallery."
        actions={
          <Button onClick={toggleForm} className="btn-animated">
            <PlusCircle className="mr-2 h-5 w-5" /> {showForm ? "Cancel" : "Add New Video"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8 card-animated">
          <CardHeader>
            <CardTitle className="font-body">{editingVideo ? "Edit Video" : "Add a New Video"}</CardTitle>
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
          <h3 className="text-xl font-semibold text-foreground mb-2">No Videos in Gallery</h3>
          <p className="text-muted-foreground">Click "Add New Video" to get started.</p>
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
                <p className="text-muted-foreground line-clamp-2">Category: {video.category || 'N/A'}</p>
                <p className="text-muted-foreground line-clamp-2">
                    URL: <Link href={video.videoUrl} target="_blank" className="hover:underline">{video.videoUrl}</Link>
                </p>
              </CardContent>
              <CardFooter className="flex w-full space-x-2 !pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditVideo(video)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the video "{video.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteVideo(video.id!, video.title)}>
                          Delete
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

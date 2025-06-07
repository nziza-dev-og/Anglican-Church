
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { VIDEOS_COLLECTION } from "@/lib/constants";
import type { Video } from "@/types";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const videoFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  videoUrl: z.string().url({ message: "Please enter a valid video URL." }),
  thumbnailUrl: z.string().url({ message: "Please enter a valid thumbnail URL." }).optional().or(z.literal('')),
  category: z.string().optional(),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

interface VideoFormProps {
  onVideoSaved: (video: Video) => void;
  editingVideo?: Video | null;
}

export default function VideoForm({ onVideoSaved, editingVideo }: VideoFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      category: "",
    },
  });

  useEffect(() => {
    if (editingVideo) {
      form.reset({
        title: editingVideo.title,
        description: editingVideo.description || "",
        videoUrl: editingVideo.videoUrl,
        thumbnailUrl: editingVideo.thumbnailUrl || "",
        category: editingVideo.category || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        videoUrl: "",
        thumbnailUrl: "",
        category: "",
      });
    }
  }, [editingVideo, form]);

  async function onSubmit(data: VideoFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const videoData = {
        ...data,
        thumbnailUrl: data.thumbnailUrl || undefined, // Store undefined if empty string
        uploadedBy: user.uid,
      };

      if (editingVideo?.id) {
        const videoDocRef = doc(db, VIDEOS_COLLECTION, editingVideo.id);
        await updateDoc(videoDocRef, {
          ...videoData,
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Video Updated", description: `"${data.title}" has been successfully updated.` });
        onVideoSaved({ ...editingVideo, ...videoData, updatedAt: new Date() } as Video);
      } else {
        const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), {
          ...videoData,
          uploadedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Video Added", description: `"${data.title}" has been successfully added.` });
        onVideoSaved({ id: docRef.id, ...videoData, uploadedAt: new Date(), updatedAt: new Date() } as Video);
      }
      form.reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Error saving video:", error);
      toast({ title: "Failed to Save Video", description: "Could not save the video. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Title</FormLabel>
              <FormControl>
                <Input placeholder="Sermon on Faith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="A brief summary of the video..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://youtube.com/watch?v=..." {...field} />
              </FormControl>
              <FormDescription>Link to YouTube, Vimeo, or a direct video file (.mp4, .webm).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/thumbnail.jpg" {...field} />
              </FormControl>
              <FormDescription>Direct link to an image for the video thumbnail.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Sermon, Event Highlight, Music" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingVideo ? "Save Changes" : "Add Video"}
        </Button>
      </form>
    </Form>
  );
}

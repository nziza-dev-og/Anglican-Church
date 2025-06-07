
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
import { useTranslation } from "@/hooks/useTranslation";

interface VideoFormProps {
  onVideoSaved: (video: Video) => void;
  editingVideo?: Video | null;
}

export default function VideoForm({ onVideoSaved, editingVideo }: VideoFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const videoFormSchema = z.object({
    title: z.string().min(3, { message: t('bookForm.title.error') }),
    description: z.string().optional(),
    videoUrl: z.string().url({ message: t('contact.form.email.error') }),
    thumbnailUrl: z.string().url({ message: t('contact.form.email.error') }).optional().or(z.literal('')),
    category: z.string().optional(),
  });
  
  type VideoFormValues = z.infer<typeof videoFormSchema>;

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
      toast({ title: t('general.error.title'), description: t('general.error.mustBeLoggedIn'), variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const videoData = {
        ...data,
        thumbnailUrl: data.thumbnailUrl || undefined, 
        uploadedBy: user.uid,
      };

      if (editingVideo?.id) {
        const videoDocRef = doc(db, VIDEOS_COLLECTION, editingVideo.id);
        await updateDoc(videoDocRef, {
          ...videoData,
          updatedAt: serverTimestamp(),
        });
        toast({ title: t('videoForm.toast.updated.title'), description: `"${data.title}" ${t('videoForm.toast.updated.description')}` });
        onVideoSaved({ ...editingVideo, ...videoData, updatedAt: new Date() } as Video);
      } else {
        const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), {
          ...videoData,
          uploadedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: t('videoForm.toast.added.title'), description: `"${data.title}" ${t('videoForm.toast.added.description')}` });
        onVideoSaved({ id: docRef.id, ...videoData, uploadedAt: new Date(), updatedAt: new Date() } as Video);
      }
      form.reset(); 
    } catch (error) {
      console.error("Error saving video:", error);
      toast({ title: t('videoForm.toast.failed.title'), description: t('videoForm.toast.failed.description'), variant: "destructive" });
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
              <FormLabel>{t('videoForm.title.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('videoForm.title.placeholder')} {...field} />
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
              <FormLabel>{t('videoForm.description.label')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('videoForm.description.placeholder')} {...field} />
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
              <FormLabel>{t('videoForm.videoUrl.label')}</FormLabel>
              <FormControl>
                <Input type="url" placeholder={t('videoForm.videoUrl.placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('videoForm.videoUrl.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('videoForm.thumbnailUrl.label')}</FormLabel>
              <FormControl>
                <Input type="url" placeholder={t('videoForm.thumbnailUrl.placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('videoForm.thumbnailUrl.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('videoForm.category.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('videoForm.category.placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingVideo ? t('videoForm.button.save') : t('videoForm.button.add')}
        </Button>
      </form>
    </Form>
  );
}

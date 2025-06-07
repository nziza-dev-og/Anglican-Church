
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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { USERS_COLLECTION } from "@/lib/constants";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTranslation } from "@/hooks/useTranslation";

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }), // Message will be translated by form context if needed, or keep generic
  interests: z.array(z.string()).optional(),
  photoFile: z.custom<FileList>((val) => val instanceof FileList, "Please upload a file").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function UserProfileForm() {
  const { userProfile, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPhotoURL, setCurrentPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setCurrentPhotoURL(userProfile.photoURL || null);
    }
  }, [userProfile]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      interests: [],
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        displayName: userProfile.displayName || "",
        interests: userProfile.interests || [],
      });
      setCurrentPhotoURL(userProfile.photoURL || `https://placehold.co/128x128.png?text=${userProfile.displayName?.charAt(0).toUpperCase() || 'U'}`);
    }
  }, [userProfile, form.reset]);


  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({ title: t('general.error.title'), description: t('general.error.mustBeLoggedIn'), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    try {
      let finalPhotoURL: string | null;

      if (data.photoFile && data.photoFile.length > 0) {
        const file = data.photoFile[0];
        const storage = getStorage();
        const photoRef = ref(storage, `profileImages/${user.uid}/${file.name}`);
        const snapshot = await uploadBytes(photoRef, file);
        finalPhotoURL = await getDownloadURL(snapshot.ref);
        setCurrentPhotoURL(finalPhotoURL);
      } else {
        finalPhotoURL = userProfile?.photoURL || null;
      }

      const userDocRef = doc(db, USERS_COLLECTION, user.uid);
      await updateDoc(userDocRef, {
        displayName: data.displayName,
        interests: data.interests || [],
        photoURL: finalPhotoURL,
      });

      toast({ title: t('dashboard.profile.toast.updated.title'), description: t('dashboard.profile.toast.updated.description') });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: t('dashboard.profile.toast.updateFailed.title'), description: t('dashboard.profile.toast.updateFailed.description'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading && !userProfile) {
    return <p>{t('dashboard.profile.loading')}</p>;
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
            {currentPhotoURL ? (
                <Image
                    src={currentPhotoURL}
                    alt={t('dashboard.profile.form.photo.label')}
                    width={128}
                    height={128}
                    className="rounded-full object-cover h-32 w-32 border-2 border-primary shadow-md"
                    data-ai-hint="user profile"
                />
            ) : (
              <div 
                className="rounded-full object-cover h-32 w-32 border-2 border-primary shadow-md bg-muted flex items-center justify-center text-4xl text-muted-foreground"
                data-ai-hint="user profile placeholder"
              >
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <FormField
              control={form.control}
              name="photoFile"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>{t('dashboard.profile.form.photo.label')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        onChange(e.target.files);
                        if (e.target.files && e.target.files[0]) {
                           const reader = new FileReader();
                           reader.onload = (event) => {
                             setCurrentPhotoURL(event.target?.result as string);
                           };
                           reader.readAsDataURL(e.target.files[0]);
                        } else {
                           setCurrentPhotoURL(userProfile?.photoURL || `https://placehold.co/128x128.png?text=${userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}`);
                        }
                      }}
                      {...rest}
                    />
                  </FormControl>
                  <FormDescription>{t('dashboard.profile.form.photo.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('dashboard.profile.form.displayName.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('auth.displayName.placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('dashboard.profile.form.displayName.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('dashboard.profile.form.interests.label')}</FormLabel>
              <FormDescription>
                {t('dashboard.profile.form.interests.description')}
              </FormDescription>
              <FormControl>
                 <Textarea
                    placeholder={t('dashboard.profile.form.interests.placeholder')}
                    className="h-24"
                    value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                    onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                  />
              </FormControl>
               <FormDescription>
                 {t('dashboard.profile.form.interests.example')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="btn-animated">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('dashboard.profile.form.button.update')}
        </Button>
      </form>
    </Form>
  );
}

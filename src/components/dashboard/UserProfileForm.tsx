
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const UserProfileForm = () => {
  const { userProfile, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPhotoURL, setCurrentPhotoURL] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const profileFormSchema = z.object({
    displayName: z.string().min(2, { message: t('auth.displayName.errorMinLength') }),
    interests: z.array(z.string()).optional(),
    photoInputMethod: z.enum(["upload", "url"], { required_error: t('dashboard.profile.form.photoInputMethod.error')}),
    photoFile: z.custom<FileList>((val) => val === undefined || (val instanceof FileList && val.length <= 1), {
      message: t('dashboard.profile.form.photo.fileError'),
    }).optional(),
    photoUrlInput: z.string().optional().transform(value => value === "" ? undefined : value),
  }).refine(data => {
    if (data.photoInputMethod === "url" && data.photoUrlInput) {
      try {
        new URL(data.photoUrlInput);
        return true;
      } catch (_) {
        return false;
      }
    }
    return true;
  }, {
    message: t('dashboard.profile.form.photoUrlInput.error'),
    path: ["photoUrlInput"],
  });

  type ProfileFormValues = z.infer<typeof profileFormSchema>;
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      interests: [],
      photoInputMethod: "upload",
      photoUrlInput: "",
    },
  });

  const photoInputMethod = form.watch("photoInputMethod");
  const photoUrlInputValue = form.watch("photoUrlInput");

  useEffect(() => {
    if (userProfile) {
      const initialPhotoInputMethod = userProfile.photoURL && !userProfile.photoURL.includes("firebasestorage.googleapis.com") && !userProfile.photoURL.startsWith("https://placehold.co") ? "url" : "upload";
      form.reset({
        displayName: userProfile.displayName || "",
        interests: userProfile.interests || [],
        photoInputMethod: initialPhotoInputMethod,
        photoUrlInput: initialPhotoInputMethod === "url" ? userProfile.photoURL || "" : "",
      });
      setPhotoPreview(userProfile.photoURL || `https://placehold.co/128x128.png?text=${userProfile.displayName?.charAt(0).toUpperCase() || 'U'}`);
    }
  }, [userProfile, form.reset]);

  useEffect(() => {
    if (photoInputMethod === "url") {
      if (photoUrlInputValue && z.string().url().safeParse(photoUrlInputValue).success) {
        setPhotoPreview(photoUrlInputValue);
      } else if (!photoUrlInputValue) {
         setPhotoPreview(userProfile?.photoURL || `https://placehold.co/128x128.png?text=${userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}`);
      }
    }
  }, [photoInputMethod, photoUrlInputValue, userProfile]);


  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({ title: t('general.error.title'), description: t('general.error.mustBeLoggedIn'), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    let finalPhotoURL: string | null = userProfile?.photoURL || null;

    try {
      if (data.photoInputMethod === "upload" && data.photoFile && data.photoFile.length > 0) {
        const file = data.photoFile[0];
        const storage = getStorage();
        const photoRef = ref(storage, `profileImages/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(photoRef, file);
        finalPhotoURL = await getDownloadURL(snapshot.ref);
      } else if (data.photoInputMethod === "url") {
        if (data.photoUrlInput && z.string().url().safeParse(data.photoUrlInput).success) {
          finalPhotoURL = data.photoUrlInput;
        } else if (!data.photoUrlInput) {
            finalPhotoURL = `https://placehold.co/128x128.png?text=${data.displayName?.charAt(0).toUpperCase() || 'U'}`;
        }
      }

      const userDocRef = doc(db, USERS_COLLECTION, user.uid);
      await updateDoc(userDocRef, {
        displayName: data.displayName,
        interests: data.interests || [],
        photoURL: finalPhotoURL,
      });
      
      setPhotoPreview(finalPhotoURL); // Update preview with the final URL after successful save
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
            {photoPreview ? (
                <Image
                    src={photoPreview}
                    alt={t('dashboard.profile.form.photo.label')}
                    width={128}
                    height={128}
                    className="rounded-full object-cover h-32 w-32 border-2 border-primary shadow-md"
                    data-ai-hint="user profile"
                    onError={() => setPhotoPreview(`https://placehold.co/128x128.png?text=${form.getValues('displayName')?.charAt(0).toUpperCase() || 'U'}`)}
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
              name="photoInputMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('dashboard.profile.form.photoInputMethod.label')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        // When switching methods, reset the other method's input
                        if (value === "url") {
                          form.setValue("photoFile", undefined);
                          if (form.getValues("photoUrlInput") && z.string().url().safeParse(form.getValues("photoUrlInput")).success) {
                            setPhotoPreview(form.getValues("photoUrlInput")!);
                          } else {
                            setPhotoPreview(userProfile?.photoURL || `https://placehold.co/128x128.png?text=${userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}`);
                          }
                        } else { // "upload"
                          form.setValue("photoUrlInput", "");
                          // Preview for upload is handled by photoFile field's onChange
                           setPhotoPreview(userProfile?.photoURL || `https://placehold.co/128x128.png?text=${userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}`);
                        }
                      }}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="upload" /></FormControl>
                        <FormLabel className="font-normal">{t('dashboard.profile.form.photoInputMethod.upload')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="url" /></FormControl>
                        <FormLabel className="font-normal">{t('dashboard.profile.form.photoInputMethod.url')}</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {photoInputMethod === "upload" && (
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
                               setPhotoPreview(event.target?.result as string);
                             };
                             reader.readAsDataURL(e.target.files[0]);
                          } else {
                             setPhotoPreview(userProfile?.photoURL || `https://placehold.co/128x128.png?text=${userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}`);
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
            )}

            {photoInputMethod === "url" && (
              <FormField
                control={form.control}
                name="photoUrlInput"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t('dashboard.profile.form.photoUrlInput.label')}</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder={t('dashboard.profile.form.photoUrlInput.placeholder')}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          if (e.target.value && z.string().url().safeParse(e.target.value).success) {
                            setPhotoPreview(e.target.value);
                          } else if (!e.target.value) {
                            setPhotoPreview(userProfile?.photoURL || `https://placehold.co/128x128.png?text=${userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}`);
                          }
                        }}
                      />
                    </FormControl>
                     <FormDescription>{t('dashboard.profile.form.photoUrlInput.description')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
export default UserProfileForm;

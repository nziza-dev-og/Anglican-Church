
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

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  interests: z.array(z.string()).optional(),
  photoFile: z.custom<FileList>((val) => val instanceof FileList, "Please upload a file").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function UserProfileForm() {
  const { userProfile, user, loading: authLoading } = useAuth(); // Added authLoading
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed loading to isSubmitting
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
      toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
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
        // No new file uploaded, use existing photoURL from userProfile, defaulting to null if it's undefined
        finalPhotoURL = userProfile?.photoURL || null;
      }

      const userDocRef = doc(db, USERS_COLLECTION, user.uid);
      await updateDoc(userDocRef, {
        displayName: data.displayName,
        interests: data.interests || [],
        photoURL: finalPhotoURL, // This is now guaranteed to be string or null
      });

      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Update Failed", description: "Could not update your profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading && !userProfile) {
    return <p>Loading profile...</p>; // Or a skeleton loader
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
            {currentPhotoURL ? (
                <Image
                    src={currentPhotoURL}
                    alt="Profile Picture"
                    width={128}
                    height={128}
                    className="rounded-full object-cover h-32 w-32 border-2 border-primary shadow-md"
                    data-ai-hint="user profile"
                    // Add unoptimized if using non-standard image hosts or SVGs
                    // unoptimized={currentPhotoURL.startsWith('data:')}
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
                  <FormLabel>Profile Picture</FormLabel>
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
                          // If file is cleared, revert to original or placeholder
                           setCurrentPhotoURL(userProfile?.photoURL || `https://placehold.co/128x128.png?text=${userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}`);
                        }
                      }}
                      {...rest}
                    />
                  </FormControl>
                  <FormDescription>Upload a new profile picture (optional).</FormDescription>
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
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interests</FormLabel>
              <FormDescription>
                List your interests to help us personalize your experience. Separate interests with a comma.
              </FormDescription>
              <FormControl>
                 <Textarea
                    placeholder="E.g. Bible Study, Music, Community Service..."
                    className="h-24"
                    value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                    onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                  />
              </FormControl>
               <FormDescription>
                 Example: Music, Bible Study, Youth Ministry
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="btn-animated">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Profile
        </Button>
      </form>
    </Form>
  );
}

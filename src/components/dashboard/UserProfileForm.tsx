
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
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// TODO: Add more interests, perhaps fetch from a predefined list or allow free text
const availableInterests = ["Bible Study", "Music", "Community Service", "Youth Ministry", "Evangelism", "Prayer Group"];

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }),
  interests: z.array(z.string()).optional(), // Comma-separated string for textarea, then split
  photoFile: z.custom<FileList>((val) => val instanceof FileList, "Please upload a file").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function UserProfileForm() {
  const { userProfile, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentPhotoURL, setCurrentPhotoURL] = useState(userProfile?.photoURL || '');


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: userProfile?.displayName || "",
      interests: userProfile?.interests || [],
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      let newPhotoURL = userProfile?.photoURL;
      if (data.photoFile && data.photoFile.length > 0) {
        const file = data.photoFile[0];
        const storage = getStorage();
        // Create a storage reference with a unique name (e.g., userUID/profileImage.jpg)
        const photoRef = ref(storage, `profileImages/${user.uid}/${file.name}`);
        
        // Upload the file
        const snapshot = await uploadBytes(photoRef, file);
        
        // Get the download URL
        newPhotoURL = await getDownloadURL(snapshot.ref);
        setCurrentPhotoURL(newPhotoURL); // Update displayed image immediately
      }

      const userDocRef = doc(db, USERS_COLLECTION, user.uid);
      await updateDoc(userDocRef, {
        displayName: data.displayName,
        interests: data.interests || [],
        photoURL: newPhotoURL, // Update photoURL in Firestore
      });

      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Update Failed", description: "Could not update your profile. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
            {currentPhotoURL && (
                <Image
                    src={currentPhotoURL}
                    alt="Profile Picture"
                    width={128}
                    height={128}
                    className="rounded-full object-cover h-32 w-32 border-2 border-primary shadow-md"
                    data-ai-hint="user profile"
                />
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
                Select your interests to help us personalize your experience. (Ctrl/Cmd + click to select multiple)
              </FormDescription>
              <FormControl>
                 <Textarea
                    placeholder="E.g. Bible Study, Music, Community Service..."
                    className="h-24"
                    value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                    onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(s => s))}
                  />
              </FormControl>
               <FormDescription>
                 Separate interests with a comma. Example: Music, Bible Study, Youth Ministry
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={loading} className="btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Profile
        </Button>
      </form>
    </Form>
  );
}


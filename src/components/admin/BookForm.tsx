
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
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/lib/firebase";
import { BOOKS_COLLECTION } from "@/lib/constants";
import type { Book } from "@/types";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const bookFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  author: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  bookFile: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, "Book file is required."),
  coverImageFile: z.custom<FileList>((val) => val instanceof FileList, "Please upload a file").optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

interface BookFormProps {
  onBookAdded?: (book: Book) => void;
}

export default function BookForm({ onBookAdded }: BookFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      category: "",
    },
  });

  async function onSubmit(data: BookFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const storage = getStorage();
      
      // Upload book file
      const bookFile = data.bookFile[0];
      const bookFileRef = ref(storage, `books/${user.uid}/${Date.now()}_${bookFile.name}`);
      const bookUploadSnapshot = await uploadBytes(bookFileRef, bookFile);
      const downloadUrl = await getDownloadURL(bookUploadSnapshot.ref);

      // Upload cover image if provided
      let coverImageUrl: string | undefined = undefined;
      if (data.coverImageFile && data.coverImageFile.length > 0) {
        const coverFile = data.coverImageFile[0];
        const coverImageRef = ref(storage, `covers/${user.uid}/${Date.now()}_${coverFile.name}`);
        const coverUploadSnapshot = await uploadBytes(coverImageRef, coverFile);
        coverImageUrl = await getDownloadURL(coverUploadSnapshot.ref);
      }

      const newBookData: Omit<Book, 'id' | 'uploadedAt'> & { uploadedAt: any } = {
        title: data.title,
        author: data.author,
        description: data.description,
        category: data.category,
        downloadUrl,
        coverImageUrl,
        uploadedBy: user.uid,
        uploadedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, BOOKS_COLLECTION), newBookData);
      
      toast({ title: "Book Added", description: `"${data.title}" has been successfully added.` });
      form.reset();
      if (onBookAdded) {
        onBookAdded({ id: docRef.id, ...newBookData, uploadedAt: new Date() } as Book); // Provide immediate feedback
      }
    } catch (error) {
      console.error("Error adding book:", error);
      toast({ title: "Failed to Add Book", description: "Could not add the book. Please try again.", variant: "destructive" });
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
              <FormLabel>Book Title</FormLabel>
              <FormControl>
                <Input placeholder="The Pilgrim's Progress" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="John Bunyan" {...field} />
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
                <Textarea placeholder="A brief summary of the book..." {...field} />
              </FormControl>
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
                <Input placeholder="e.g., Theology, Biography, Devotional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bookFile"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Book File (PDF, EPUB, etc.)</FormLabel>
              <FormControl>
                 <Input type="file" onChange={(e) => onChange(e.target.files)} {...rest} />
              </FormControl>
              <FormDescription>Upload the main book file.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coverImageFile"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Cover Image (Optional)</FormLabel>
              <FormControl>
                 <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} />
              </FormControl>
              <FormDescription>Upload an image for the book cover.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Book
        </Button>
      </form>
    </Form>
  );
}

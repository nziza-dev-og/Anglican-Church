
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
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "@/lib/firebase";
import { BOOKS_COLLECTION } from "@/lib/constants";
import type { Book } from "@/types";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const bookFormSchemaBase = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  author: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  bookInputMethod: z.enum(["upload", "url"]),
  bookFile: z.custom<FileList>().optional(),
  bookUrl: z.string().url().optional(),
  coverInputMethod: z.enum(["upload", "url"]),
  coverImageFile: z.custom<FileList>().optional(),
  coverImageUrlInput: z.string().url().optional(),
});

const bookFormSchema = bookFormSchemaBase
  .refine(
    (data) => {
      if (data.bookInputMethod === "upload") return data.bookFile && data.bookFile.length > 0;
      if (data.bookInputMethod === "url") return !!data.bookUrl;
      return false;
    },
    {
      message: "Book file or URL is required based on selection.",
      path: ["bookFile"], // Or bookUrl, depends on context
    }
  )
  .refine(
    (data) => {
      if (data.coverInputMethod === "upload" && data.coverImageFile && data.coverImageFile.length > 0) return true;
      if (data.coverInputMethod === "url" && !!data.coverImageUrlInput) return true;
      if (data.coverInputMethod === "upload" && (!data.coverImageFile || data.coverImageFile.length === 0) && !data.coverImageUrlInput) return true; // Optional cover
      if (data.coverInputMethod === "url" && !data.coverImageUrlInput && (!data.coverImageFile || data.coverImageFile.length === 0)) return true; // Optional cover
      return false;
    },
    {
      message: "Cover image file or URL is required if method is selected, or clear selection if no cover.",
      path: ["coverImageFile"], // Or coverImageUrlInput
    }
  );


type BookFormValues = z.infer<typeof bookFormSchema>;

interface BookFormProps {
  onBookAdded: (book: Book) => void; // Changed from onBookAdded to onBookSaved for consistency
  editingBook?: Book | null;
}

export default function BookForm({ onBookAdded, editingBook }: BookFormProps) {
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
      bookInputMethod: "upload",
      bookUrl: "",
      coverInputMethod: "upload",
      coverImageUrlInput: "",
    },
  });

  const bookInputMethod = form.watch("bookInputMethod");
  const coverInputMethod = form.watch("coverInputMethod");

  useEffect(() => {
    if (editingBook) {
      // Determine input methods based on existing URLs
      const bookIsUrl = editingBook.downloadUrl && !editingBook.downloadUrl.includes("firebasestorage.googleapis.com"); // Heuristic
      const coverIsUrl = editingBook.coverImageUrl && !editingBook.coverImageUrl.includes("firebasestorage.googleapis.com");

      form.reset({
        title: editingBook.title,
        author: editingBook.author || "",
        description: editingBook.description || "",
        category: editingBook.category || "",
        bookInputMethod: bookIsUrl ? "url" : "upload",
        bookUrl: bookIsUrl ? editingBook.downloadUrl : "",
        // bookFile: undefined, // Let user re-upload if they want
        coverInputMethod: coverIsUrl ? "url" : "upload",
        coverImageUrlInput: coverIsUrl ? editingBook.coverImageUrl : "",
        // coverImageFile: undefined,
      });
    } else {
      form.reset({
        title: "", author: "", description: "", category: "",
        bookInputMethod: "upload", bookUrl: "",
        coverInputMethod: "upload", coverImageUrlInput: "",
      });
    }
  }, [editingBook, form]);


  async function onSubmit(data: BookFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const storage = getStorage();
      let finalDownloadUrl = data.bookUrl;
      let finalCoverImageUrl = data.coverImageUrlInput;

      // Handle book file
      if (data.bookInputMethod === "upload" && data.bookFile && data.bookFile.length > 0) {
        const bookFile = data.bookFile[0];
        const bookFileRef = ref(storage, `books/${user.uid}/${Date.now()}_${bookFile.name}`);
        const bookUploadSnapshot = await uploadBytes(bookFileRef, bookFile);
        finalDownloadUrl = await getDownloadURL(bookUploadSnapshot.ref);
      }

      // Handle cover image
      if (data.coverInputMethod === "upload" && data.coverImageFile && data.coverImageFile.length > 0) {
        const coverFile = data.coverImageFile[0];
        const coverImageRef = ref(storage, `covers/${user.uid}/${Date.now()}_${coverFile.name}`);
        const coverUploadSnapshot = await uploadBytes(coverImageRef, coverFile);
        finalCoverImageUrl = await getDownloadURL(coverUploadSnapshot.ref);
      }
      
      if (!finalDownloadUrl) {
        toast({ title: "Error", description: "Book file or URL is required.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const bookData: Omit<Book, 'id' | 'uploadedAt' | 'updatedAt'> & { uploadedAt?: any, updatedAt?: any } = {
        title: data.title,
        author: data.author,
        description: data.description,
        category: data.category,
        downloadUrl: finalDownloadUrl,
        coverImageUrl: finalCoverImageUrl || undefined, // Store undefined if empty
        uploadedBy: user.uid,
      };

      if (editingBook?.id) {
        const bookDocRef = doc(db, BOOKS_COLLECTION, editingBook.id);
        bookData.updatedAt = serverTimestamp();
        await updateDoc(bookDocRef, bookData);
        toast({ title: "Book Updated", description: `"${data.title}" has been successfully updated.`});
        onBookAdded({ ...editingBook, ...bookData, updatedAt: new Date() } as Book);
      } else {
        bookData.uploadedAt = serverTimestamp();
        bookData.updatedAt = serverTimestamp();
        const docRef = await addDoc(collection(db, BOOKS_COLLECTION), bookData);
        toast({ title: "Book Added", description: `"${data.title}" has been successfully added.` });
        onBookAdded({ id: docRef.id, ...bookData, uploadedAt: new Date(), updatedAt: new Date() } as Book);
      }
      form.reset({
        title: "", author: "", description: "", category: "",
        bookInputMethod: "upload", bookUrl: "",
        coverInputMethod: "upload", coverImageUrlInput: "",
      });

    } catch (error) {
      console.error("Error adding/updating book:", error);
      toast({ title: "Failed to Save Book", description: "Could not save the book. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Book Title</FormLabel> <FormControl><Input placeholder="The Pilgrim's Progress" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="author" render={({ field }) => ( <FormItem> <FormLabel>Author (Optional)</FormLabel> <FormControl><Input placeholder="John Bunyan" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description (Optional)</FormLabel> <FormControl><Textarea placeholder="A brief summary of the book..." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Category (Optional)</FormLabel> <FormControl><Input placeholder="e.g., Theology, Biography" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>

        <FormField
          control={form.control}
          name="bookInputMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Book Source</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2 space-y-0"> <FormControl><RadioGroupItem value="upload" /></FormControl> <FormLabel className="font-normal">Upload File</FormLabel> </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0"> <FormControl><RadioGroupItem value="url" /></FormControl> <FormLabel className="font-normal">Use URL</FormLabel> </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {bookInputMethod === "upload" && (
          <FormField control={form.control} name="bookFile" render={({ field: { onChange, ...rest } }) => ( <FormItem> <FormLabel>Book File (PDF, EPUB, etc.)</FormLabel> <FormControl><Input type="file" onChange={(e) => onChange(e.target.files)} {...rest} /></FormControl> <FormMessage /> </FormItem> )}/>
        )}
        {bookInputMethod === "url" && (
          <FormField control={form.control} name="bookUrl" render={({ field }) => ( <FormItem> <FormLabel>Book URL</FormLabel> <FormControl><Input type="url" placeholder="https://example.com/book.pdf" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        )}

        <FormField
          control={form.control}
          name="coverInputMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Cover Image Source (Optional)</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2 space-y-0"> <FormControl><RadioGroupItem value="upload" /></FormControl> <FormLabel className="font-normal">Upload Image</FormLabel> </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0"> <FormControl><RadioGroupItem value="url" /></FormControl> <FormLabel className="font-normal">Use Image URL</FormLabel> </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {coverInputMethod === "upload" && (
          <FormField control={form.control} name="coverImageFile" render={({ field: { onChange, ...rest } }) => ( <FormItem> <FormLabel>Cover Image File</FormLabel> <FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} /></FormControl> <FormMessage /> </FormItem> )}/>
        )}
        {coverInputMethod === "url" && (
          <FormField control={form.control} name="coverImageUrlInput" render={({ field }) => ( <FormItem> <FormLabel>Cover Image URL</FormLabel> <FormControl><Input type="url" placeholder="https://example.com/cover.jpg" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        )}
        
        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingBook ? "Save Changes" : "Add Book"}
        </Button>
      </form>
    </Form>
  );
}

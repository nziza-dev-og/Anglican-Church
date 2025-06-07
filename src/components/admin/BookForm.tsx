
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
import { useTranslation } from "@/hooks/useTranslation";

const BookForm = ({ onBookAdded, editingBook }: { onBookAdded: (book: Book) => void; editingBook?: Book | null; }) => {
  const { t } = useTranslation();

  const bookFormSchemaBase = z.object({
    title: z.string().min(3, { message: t('bookForm.title.error') }),
    author: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    bookInputMethod: z.enum(["upload", "url"]),
    bookFile: z.custom<FileList>().optional(),
    bookUrl: z.string().url({ message: t('contact.form.email.error') /* Re-use generic URL error or add specific */ }).optional(), // Using email error as placeholder
    coverInputMethod: z.enum(["upload", "url"]),
    coverImageFile: z.custom<FileList>().optional(),
    coverImageUrlInput: z.string().url({ message: t('contact.form.email.error') /* Re-use generic URL error */}).optional(),
  });
  
  const bookFormSchema = bookFormSchemaBase
    .refine(
      (data) => {
        if (data.bookInputMethod === "upload") return !editingBook || (editingBook && data.bookFile && data.bookFile.length > 0) || (editingBook && !data.bookFile); // Allow no file on edit if not changing
        if (data.bookInputMethod === "upload" && !editingBook) return data.bookFile && data.bookFile.length > 0;
        if (data.bookInputMethod === "url") return !!data.bookUrl;
        return false;
      },
      {
        message: t('bookForm.error.sourceRequired'),
        path: ["bookFile"], 
      }
    )
     .refine(
      (data) => { // Cover is optional
        if (data.coverInputMethod === "upload" && data.coverImageFile && data.coverImageFile.length > 0) return true;
        if (data.coverInputMethod === "url" && !!data.coverImageUrlInput) return true;
        // If no new file/URL is provided, it's fine (cover is optional or keeping existing)
        return true; 
      },
      {
        message: t('bookForm.error.coverRequired'), 
        path: ["coverImageFile"], 
      }
    );

  type BookFormValues = z.infer<typeof bookFormSchema>;
  
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
      const bookIsUrl = editingBook.downloadUrl && !editingBook.downloadUrl.includes("firebasestorage.googleapis.com");
      const coverIsUrl = editingBook.coverImageUrl && !editingBook.coverImageUrl.includes("firebasestorage.googleapis.com");

      form.reset({
        title: editingBook.title,
        author: editingBook.author || "",
        description: editingBook.description || "",
        category: editingBook.category || "",
        bookInputMethod: bookIsUrl ? "url" : "upload",
        bookUrl: bookIsUrl ? editingBook.downloadUrl : "",
        coverInputMethod: coverIsUrl ? "url" : "upload",
        coverImageUrlInput: coverIsUrl ? editingBook.coverImageUrl : "",
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
      toast({ title: t('general.error.unexpected'), description: t('general.error.mustBeLoggedIn'), variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      let finalDownloadUrl = editingBook?.downloadUrl; // Start with existing if editing
      let finalCoverImageUrl = editingBook?.coverImageUrl; // Start with existing if editing


      if (data.bookInputMethod === "upload" && data.bookFile && data.bookFile.length > 0) {
        const bookFile = data.bookFile[0];
        const storage = getStorage();
        const bookFileRef = ref(storage, `books/${user.uid}/${Date.now()}_${bookFile.name}`);
        const bookUploadSnapshot = await uploadBytes(bookFileRef, bookFile);
        finalDownloadUrl = await getDownloadURL(bookUploadSnapshot.ref);
      } else if (data.bookInputMethod === "url" && data.bookUrl) {
        finalDownloadUrl = data.bookUrl;
      }
      
      if (data.coverInputMethod === "upload" && data.coverImageFile && data.coverImageFile.length > 0) {
        const coverFile = data.coverImageFile[0];
        const storage = getStorage();
        const coverImageRef = ref(storage, `covers/${user.uid}/${Date.now()}_${coverFile.name}`);
        const coverUploadSnapshot = await uploadBytes(coverImageRef, coverFile);
        finalCoverImageUrl = await getDownloadURL(coverUploadSnapshot.ref);
      } else if (data.coverInputMethod === "url" && data.coverImageUrlInput) {
        finalCoverImageUrl = data.coverImageUrlInput;
      } else if (data.coverInputMethod === "upload" && (!data.coverImageFile || data.coverImageFile.length === 0) && !editingBook?.coverImageUrl && !data.coverImageUrlInput) {
        // If was upload, no new file, no existing cover, and no input URL -> means no cover or cleared
        finalCoverImageUrl = undefined;
      } else if (data.coverInputMethod === "url" && !data.coverImageUrlInput && !editingBook?.coverImageUrl && (!data.coverImageFile || data.coverImageFile.length === 0)) {
        // If was URL, no new URL, no existing cover, and no input file -> means no cover or cleared
        finalCoverImageUrl = undefined;
      }


      if (!finalDownloadUrl) {
        toast({ title: t('general.error.unexpected'), description: t('bookForm.error.noDownloadUrl'), variant: "destructive" });
        setLoading(false);
        return;
      }

      const bookData: Omit<Book, 'id' | 'uploadedAt' | 'updatedAt'> & { uploadedAt?: any, updatedAt?: any } = {
        title: data.title,
        author: data.author,
        description: data.description,
        category: data.category,
        downloadUrl: finalDownloadUrl,
        coverImageUrl: finalCoverImageUrl || undefined, 
        uploadedBy: user.uid,
      };

      if (editingBook?.id) {
        const bookDocRef = doc(db, BOOKS_COLLECTION, editingBook.id);
        bookData.updatedAt = serverTimestamp();
        await updateDoc(bookDocRef, bookData);
        toast({ title: t('bookForm.toast.updated.title'), description: `"${data.title}" ${t('bookForm.toast.updated.description')}`});
        onBookAdded({ ...editingBook, ...bookData, updatedAt: new Date() } as Book);
      } else {
        bookData.uploadedAt = serverTimestamp();
        bookData.updatedAt = serverTimestamp();
        const docRef = await addDoc(collection(db, BOOKS_COLLECTION), bookData);
        toast({ title: t('bookForm.toast.added.title'), description: `"${data.title}" ${t('bookForm.toast.added.description')}` });
        onBookAdded({ id: docRef.id, ...bookData, uploadedAt: new Date(), updatedAt: new Date() } as Book);
      }
      form.reset({
        title: "", author: "", description: "", category: "",
        bookInputMethod: "upload", bookUrl: "",
        coverInputMethod: "upload", coverImageUrlInput: "",
      });

    } catch (error) {
      console.error("Error adding/updating book:", error);
      toast({ title: t('bookForm.toast.failed.title'), description: t('bookForm.toast.failed.description'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>{t('bookForm.title.label')}</FormLabel> <FormControl><Input placeholder={t('bookForm.title.placeholder')} {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="author" render={({ field }) => ( <FormItem> <FormLabel>{t('bookForm.author.label')}</FormLabel> <FormControl><Input placeholder={t('bookForm.author.placeholder')} {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>{t('bookForm.description.label')}</FormLabel> <FormControl><Textarea placeholder={t('bookForm.description.placeholder')} {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>{t('bookForm.category.label')}</FormLabel> <FormControl><Input placeholder={t('bookForm.category.placeholder')} {...field} /></FormControl> <FormMessage /> </FormItem> )}/>

        <FormField
          control={form.control}
          name="bookInputMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('bookForm.source.label')}</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2 space-y-0"> <FormControl><RadioGroupItem value="upload" /></FormControl> <FormLabel className="font-normal">{t('bookForm.source.upload')}</FormLabel> </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0"> <FormControl><RadioGroupItem value="url" /></FormControl> <FormLabel className="font-normal">{t('bookForm.source.url')}</FormLabel> </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {bookInputMethod === "upload" && (
          <FormField control={form.control} name="bookFile" render={({ field: { onChange, value, ...rest } }) => ( <FormItem> <FormLabel>{t('bookForm.file.label')}</FormLabel> <FormControl><Input type="file" onChange={(e) => onChange(e.target.files)} {...rest} /></FormControl> <FormMessage /> </FormItem> )}/>
        )}
        {bookInputMethod === "url" && (
          <FormField control={form.control} name="bookUrl" render={({ field }) => ( <FormItem> <FormLabel>{t('bookForm.url.label')}</FormLabel> <FormControl><Input type="url" placeholder={t('bookForm.url.placeholder')} {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        )}

        <FormField
          control={form.control}
          name="coverInputMethod"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('bookForm.coverSource.label')}</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2 space-y-0"> <FormControl><RadioGroupItem value="upload" /></FormControl> <FormLabel className="font-normal">{t('bookForm.coverSource.upload')}</FormLabel> </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0"> <FormControl><RadioGroupItem value="url" /></FormControl> <FormLabel className="font-normal">{t('bookForm.coverSource.url')}</FormLabel> </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {coverInputMethod === "upload" && (
          <FormField control={form.control} name="coverImageFile" render={({ field: { onChange, value, ...rest } }) => ( <FormItem> <FormLabel>{t('bookForm.coverFile.label')}</FormLabel> <FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} /></FormControl> <FormMessage /> </FormItem> )}/>
        )}
        {coverInputMethod === "url" && (
          <FormField control={form.control} name="coverImageUrlInput" render={({ field }) => ( <FormItem> <FormLabel>{t('bookForm.coverUrl.label')}</FormLabel> <FormControl><Input type="url" placeholder={t('bookForm.coverUrl.placeholder')} {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        )}
        
        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingBook ? t('bookForm.button.save') : t('bookForm.button.add')}
        </Button>
      </form>
    </Form>
  );
}
export default BookForm;

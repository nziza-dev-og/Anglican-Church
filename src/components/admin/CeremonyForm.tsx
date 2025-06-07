
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addDoc, collection, doc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CEREMONIES_COLLECTION } from "@/lib/constants";
import type { Ceremony } from "@/types";
import { useState, useEffect } from "react";

const ceremonyFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  type: z.string().min(3, { message: "Ceremony type is required (e.g., Baptism, Wedding)." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  date: z.date({ required_error: "Ceremony date is required." }),
  imageUrls: z.array(z.object({ value: z.string().url({ message: "Invalid URL."}) })).optional(),
  videoUrls: z.array(z.object({ value: z.string().url({ message: "Invalid URL."}) })).optional(),
});

type CeremonyFormValues = z.infer<typeof ceremonyFormSchema>;

interface CeremonyFormProps {
  onCeremonySaved: (ceremony: Ceremony) => void;
  editingCeremony?: Ceremony | null;
}

export default function CeremonyForm({ onCeremonySaved, editingCeremony }: CeremonyFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<CeremonyFormValues>({
    resolver: zodResolver(ceremonyFormSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      date: new Date(),
      imageUrls: [],
      videoUrls: [],
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control: form.control, name: "imageUrls" });
  const { fields: videoFields, append: appendVideo, remove: removeVideo } = useFieldArray({ control: form.control, name: "videoUrls" });

  useEffect(() => {
    if (editingCeremony) {
      form.reset({
        title: editingCeremony.title,
        type: editingCeremony.type,
        description: editingCeremony.description || "",
        date: editingCeremony.date.toDate(),
        imageUrls: editingCeremony.imageUrls?.map(url => ({ value: url })) || [],
        videoUrls: editingCeremony.videoUrls?.map(url => ({ value: url })) || [],
      });
    } else {
      form.reset({
        title: "", type: "", description: "", date: new Date(), imageUrls: [], videoUrls: []
      });
    }
  }, [editingCeremony, form]);

  async function onSubmit(data: CeremonyFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const ceremonyTimestamp = Timestamp.fromDate(data.date);
      const finalImageUrls = data.imageUrls?.map(img => img.value).filter(Boolean) || [];
      const finalVideoUrls = data.videoUrls?.map(vid => vid.value).filter(Boolean) || [];

      const ceremonyData = {
        title: data.title,
        type: data.type,
        description: data.description,
        date: ceremonyTimestamp,
        imageUrls: finalImageUrls,
        videoUrls: finalVideoUrls,
        createdBy: user.uid,
      };

      if (editingCeremony?.id) {
        const ceremonyDocRef = doc(db, CEREMONIES_COLLECTION, editingCeremony.id);
        await updateDoc(ceremonyDocRef, { ...ceremonyData, updatedAt: serverTimestamp() });
        toast({ title: "Ceremony Updated", description: `"${data.title}" has been successfully updated.` });
        onCeremonySaved({ ...editingCeremony, ...ceremonyData, date: ceremonyTimestamp, updatedAt: new Date() } as Ceremony);
      } else {
        const docRef = await addDoc(collection(db, CEREMONIES_COLLECTION), { ...ceremonyData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast({ title: "Ceremony Added", description: `"${data.title}" has been successfully added.` });
        onCeremonySaved({ id: docRef.id, ...ceremonyData, date: ceremonyTimestamp, createdAt: new Date(), updatedAt: new Date() } as Ceremony);
      }
      form.reset({ title: "", type: "", description: "", date: new Date(), imageUrls: [], videoUrls: []});
    } catch (error) {
      console.error("Error saving ceremony:", error);
      toast({ title: "Failed to Save Ceremony", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Ceremony Title</FormLabel> <FormControl><Input placeholder="e.g., John & Jane's Wedding" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel>Ceremony Type</FormLabel> <FormControl><Input placeholder="e.g., Wedding, Baptism, Confirmation" {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea placeholder="Details about the ceremony..." {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="date" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Ceremony Date</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} > {field.value ? format(field.value, "PPP") : <span>Pick a date</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
        
        <div>
          <FormLabel>Image URLs (Optional)</FormLabel>
          {imageFields.map((field, index) => (
            <FormField key={field.id} control={form.control} name={`imageUrls.${index}.value`} render={({ field: itemField }) => (
              <FormItem className="flex items-center gap-2 mt-1">
                <FormControl><Input type="url" placeholder="https://example.com/image.jpg" {...itemField} /></FormControl>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                <FormMessage />
              </FormItem>
            )}/>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ value: "" })} className="mt-2"> <PlusCircle className="mr-2 h-4 w-4" /> Add Image URL </Button>
        </div>

        <div>
          <FormLabel>Video URLs (Optional)</FormLabel>
          {videoFields.map((field, index) => (
            <FormField key={field.id} control={form.control} name={`videoUrls.${index}.value`} render={({ field: itemField }) => (
              <FormItem className="flex items-center gap-2 mt-1">
                <FormControl><Input type="url" placeholder="https://youtube.com/watch?v=" {...itemField} /></FormControl>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeVideo(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                <FormMessage />
              </FormItem>
            )}/>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendVideo({ value: "" })} className="mt-2"> <PlusCircle className="mr-2 h-4 w-4" /> Add Video URL </Button>
        </div>

        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingCeremony ? "Save Changes" : "Add Ceremony"}
        </Button>
      </form>
    </Form>
  );
}

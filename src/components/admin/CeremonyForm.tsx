
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
import { useTranslation } from "@/hooks/useTranslation";

interface CeremonyFormProps {
  onCeremonySaved: (ceremony: Ceremony) => void;
  editingCeremony?: Ceremony | null;
}

export default function CeremonyForm({ onCeremonySaved, editingCeremony }: CeremonyFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const ceremonyFormSchema = z.object({
    title: z.string().min(3, { message: t('bookForm.title.error') }),
    type: z.string().min(3, { message: t('ceremonyForm.type.error') }),
    description: z.string().min(10, { message: t('contact.form.message.error') }),
    date: z.date({ required_error: t('ceremonyForm.date.error') }),
    imageUrls: z.array(z.object({ value: z.string().url({ message: t('contact.form.email.error')}) })).optional(),
    videoUrls: z.array(z.object({ value: z.string().url({ message: t('contact.form.email.error')}) })).optional(),
  });
  
  type CeremonyFormValues = z.infer<typeof ceremonyFormSchema>;

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
      toast({ title: t('general.error.title'), description: t('general.error.mustBeLoggedIn'), variant: "destructive" });
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
        toast({ title: t('ceremonyForm.toast.updated.title'), description: `"${data.title}" ${t('ceremonyForm.toast.updated.description')}` });
        onCeremonySaved({ ...editingCeremony, ...ceremonyData, date: ceremonyTimestamp, updatedAt: new Date() } as Ceremony);
      } else {
        const docRef = await addDoc(collection(db, CEREMONIES_COLLECTION), { ...ceremonyData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast({ title: t('ceremonyForm.toast.added.title'), description: `"${data.title}" ${t('ceremonyForm.toast.added.description')}` });
        onCeremonySaved({ id: docRef.id, ...ceremonyData, date: ceremonyTimestamp, createdAt: new Date(), updatedAt: new Date() } as Ceremony);
      }
      form.reset({ title: "", type: "", description: "", date: new Date(), imageUrls: [], videoUrls: []});
    } catch (error) {
      console.error("Error saving ceremony:", error);
      toast({ title: t('general.error.title'), description: t('ceremonyForm.toast.failed.description'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>{t('ceremonyForm.title.label')}</FormLabel> <FormControl><Input placeholder={t('ceremonyForm.title.placeholder')} {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="type" render={({ field }) => ( <FormItem> <FormLabel>{t('ceremonyForm.type.label')}</FormLabel> <FormControl><Input placeholder={t('ceremonyForm.type.placeholder')} {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>{t('ceremonyForm.description.label')}</FormLabel> <FormControl><Textarea placeholder={t('ceremonyForm.description.placeholder')} {...field} /></FormControl> <FormMessage /> </FormItem> )}/>
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('ceremonyForm.date.label')}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <>
                        <span> {/* Wrap the text/placeholder */}
                          {field.value ? format(field.value, "PPP") : t('ceremonyForm.date.pick')}
                        </span>
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </>
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>{t('ceremonyForm.imageUrls.label')}</FormLabel>
          {imageFields.map((field, index) => (
            <FormField key={field.id} control={form.control} name={`imageUrls.${index}.value`} render={({ field: itemField }) => (
              <FormItem className="flex items-center gap-2 mt-1">
                <FormControl><Input type="url" placeholder={t('ceremonyForm.imageUrls.placeholder')} {...itemField} /></FormControl>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                <FormMessage />
              </FormItem>
            )}/>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendImage({ value: "" })} className="mt-2"> <PlusCircle className="mr-2 h-4 w-4" /> {t('ceremonyForm.imageUrls.add')} </Button>
        </div>

        <div>
          <FormLabel>{t('ceremonyForm.videoUrls.label')}</FormLabel>
          {videoFields.map((field, index) => (
            <FormField key={field.id} control={form.control} name={`videoUrls.${index}.value`} render={({ field: itemField }) => (
              <FormItem className="flex items-center gap-2 mt-1">
                <FormControl><Input type="url" placeholder={t('ceremonyForm.videoUrls.placeholder')} {...itemField} /></FormControl>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeVideo(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                <FormMessage />
              </FormItem>
            )}/>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendVideo({ value: "" })} className="mt-2"> <PlusCircle className="mr-2 h-4 w-4" /> {t('ceremonyForm.videoUrls.add')} </Button>
        </div>

        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingCeremony ? t('ceremonyForm.button.save') : t('ceremonyForm.button.add')}
        </Button>
      </form>
    </Form>
  );
}

    
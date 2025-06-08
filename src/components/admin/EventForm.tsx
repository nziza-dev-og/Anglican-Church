
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addDoc, collection, doc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EVENTS_COLLECTION } from "@/lib/constants";
import type { ChurchEvent } from "@/types";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface EventFormProps {
  onEventSaved: (event: ChurchEvent) => void;
  editingEvent?: ChurchEvent | null;
}

export default function EventForm({ onEventSaved, editingEvent }: EventFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const eventFormSchema = z.object({
    title: z.string().min(3, { message: t('bookForm.title.error') }),
    description: z.string().min(10, { message: t('contact.form.message.error') }),
    date: z.date({ required_error: t('eventForm.date.pick') }), 
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: t('eventForm.time.error') }),
    location: z.string().optional(),
    imageUrl: z.string().url({ message: t('contact.form.email.error') }).optional().or(z.literal('')),
  });
  
  type EventFormValues = z.infer<typeof eventFormSchema>;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      time: "10:00",
      location: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (editingEvent) {
      const eventDate = editingEvent.date.toDate();
      form.reset({
        title: editingEvent.title,
        description: editingEvent.description,
        date: eventDate,
        time: format(eventDate, "HH:mm"),
        location: editingEvent.location || "",
        imageUrl: editingEvent.imageUrl || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        date: new Date(),
        time: "10:00",
        location: "",
        imageUrl: "",
      });
    }
  }, [editingEvent, form]);

  async function onSubmit(data: EventFormValues) {
    if (!user) {
      toast({ title: t('general.error.title'), description: t('general.error.mustBeLoggedIn'), variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const [hours, minutes] = data.time.split(':').map(Number);
      const eventDateTime = new Date(data.date);
      eventDateTime.setHours(hours, minutes);
      const eventTimestamp = Timestamp.fromDate(eventDateTime);

      const eventData = {
        title: data.title,
        description: data.description,
        date: eventTimestamp,
        location: data.location || undefined,
        imageUrl: data.imageUrl || undefined,
        createdBy: user.uid,
      };

      if (editingEvent?.id) {
        const eventDocRef = doc(db, EVENTS_COLLECTION, editingEvent.id);
        await updateDoc(eventDocRef, {
          ...eventData,
          updatedAt: serverTimestamp(),
        });
        toast({ title: t('eventForm.toast.updated.title'), description: `"${data.title}" ${t('eventForm.toast.updated.description')}` });
        onEventSaved({ ...editingEvent, ...eventData, date: eventTimestamp, updatedAt: new Date() } as ChurchEvent);
      } else {
        const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
          ...eventData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: t('eventForm.toast.added.title'), description: `"${data.title}" ${t('eventForm.toast.added.description')}` });
        onEventSaved({ id: docRef.id, ...eventData, date: eventTimestamp, createdAt: new Date(), updatedAt: new Date() } as ChurchEvent);
      }
       form.reset({ date: new Date(), time: "10:00", title: "", description: "", location: "", imageUrl:"" });
    } catch (error) {
      console.error("Error saving event:", error);
      toast({ title: t('eventForm.toast.failed.title'), description: t('eventForm.toast.failed.description'), variant: "destructive" });
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
              <FormLabel>{t('eventForm.title.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('eventForm.title.placeholder')} {...field} />
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
              <FormLabel>{t('eventForm.description.label')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('eventForm.description.placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('eventForm.date.label')}</FormLabel>
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
                            {field.value ? format(field.value, "PPP") : t('eventForm.date.pick')}
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
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} 
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('eventForm.time.label')}</FormLabel>
                    <FormControl>
                        <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
           />
        </div>
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventForm.location.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('eventForm.location.placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventForm.imageUrl.label')}</FormLabel>
              <FormControl>
                <Input type="url" placeholder={t('eventForm.imageUrl.placeholder')} {...field} />
              </FormControl>
              <FormDescription>{t('eventForm.imageUrl.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingEvent ? t('eventForm.button.save') : t('eventForm.button.add')}
        </Button>
      </form>
    </Form>
  );
}

    
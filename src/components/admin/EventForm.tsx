
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

const eventFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  date: z.date({ required_error: "Event date is required." }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:MM)."}),
  location: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  onEventSaved: (event: ChurchEvent) => void;
  editingEvent?: ChurchEvent | null;
}

export default function EventForm({ onEventSaved, editingEvent }: EventFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
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
        toast({ title: "Event Updated", description: `"${data.title}" has been successfully updated.` });
        onEventSaved({ ...editingEvent, ...eventData, date: eventTimestamp, updatedAt: new Date() } as ChurchEvent);
      } else {
        const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
          ...eventData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: "Event Added", description: `"${data.title}" has been successfully added.` });
        onEventSaved({ id: docRef.id, ...eventData, date: eventTimestamp, createdAt: new Date(), updatedAt: new Date() } as ChurchEvent);
      }
       form.reset({ date: new Date(), time: "10:00", title: "", description: "", location: "", imageUrl:"" });
    } catch (error) {
      console.error("Error saving event:", error);
      toast({ title: "Failed to Save Event", description: "Could not save the event. Please try again.", variant: "destructive" });
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
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Sunday Service" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Details about the event..." {...field} />
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
                <FormLabel>Event Date</FormLabel>
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
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
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
                    <FormLabel>Event Time (HH:MM)</FormLabel>
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
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Church Main Hall" {...field} />
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
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/event-image.jpg" {...field} />
              </FormControl>
              <FormDescription>Link to an image for the event.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} className="w-full btn-animated">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {editingEvent ? "Save Changes" : "Add Event"}
        </Button>
      </form>
    </Form>
  );
}

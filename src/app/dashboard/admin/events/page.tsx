
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EVENTS_COLLECTION, USER_ROLES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { ChurchEvent } from "@/types";
import { collection, getDocs, query, orderBy, Timestamp, doc, deleteDoc } from "firebase/firestore";
import { CalendarClock, MapPin, PlusCircle, Trash2, Edit, ListChecks } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import EventForm from "@/components/admin/EventForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const formatDate = (timestamp: Timestamp | Date, includeTime: boolean = true) => {
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return date.toLocaleDateString('en-US', options);
};

export default function AdminEventsPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);

  useEffect(() => {
    if (!authLoading && userProfile &&
        (userProfile.role !== USER_ROLES.CHURCH_ADMIN && userProfile.role !== USER_ROLES.SUPER_ADMIN)) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  const fetchEvents = async () => {
    setLoadingData(true);
    try {
      const eventsQuery = query(collection(db, EVENTS_COLLECTION), orderBy("date", "desc"));
      const querySnapshot = await getDocs(eventsQuery);
      const fetchedEvents: ChurchEvent[] = [];
      querySnapshot.forEach((doc) => {
        fetchedEvents.push({ id: doc.id, ...doc.data() } as ChurchEvent);
      });
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({ title: "Error", description: "Could not fetch events.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (userProfile && (userProfile.role === USER_ROLES.CHURCH_ADMIN || userProfile.role === USER_ROLES.SUPER_ADMIN)) {
      fetchEvents();
    }
  }, [userProfile]);

  const handleEventSaved = (savedEvent: ChurchEvent) => {
     if (editingEvent) {
      setEvents(prevEvents => prevEvents.map(e => e.id === savedEvent.id ? savedEvent : e).sort((a, b) => (b.date as Timestamp).toMillis() - (a.date as Timestamp).toMillis()));
    } else {
      setEvents(prevEvents => [savedEvent, ...prevEvents].sort((a,b) => (b.date as Timestamp).toMillis() - (a.date as Timestamp).toMillis()));
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event: ChurchEvent) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    try {
      await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
      setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
      toast({ title: "Event Deleted", description: `"${eventTitle}" has been removed.` });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ title: "Error", description: "Could not delete event.", variant: "destructive"});
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      setEditingEvent(null);
    }
  };
  
  if (authLoading || (!userProfile && !authLoading)) {
     return (
      <div>
        <PageTitle title="Manage Events" />
        <Skeleton className="h-12 w-32 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Manage Events"
        subtitle="Create, update, and manage church events."
        actions={
          <Button onClick={toggleForm} className="btn-animated">
            <PlusCircle className="mr-2 h-5 w-5" /> {showForm ? "Cancel" : "Add New Event"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8 card-animated">
          <CardHeader>
            <CardTitle className="font-body">{editingEvent ? "Edit Event" : "Add a New Event"}</CardTitle>
          </CardHeader>
          <CardContent>
            <EventForm onEventSaved={handleEventSaved} editingEvent={editingEvent} />
          </CardContent>
        </Card>
      )}

      {loadingData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden card-animated">
            <Skeleton className="aspect-video w-full" />
            <CardHeader><Skeleton className="h-5 w-3/4 mb-1" /><Skeleton className="h-4 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-5/6" /></CardContent>
            <CardFooter className="flex space-x-2"><Skeleton className="h-9 flex-1" /><Skeleton className="h-9 flex-1" /></CardFooter>
          </Card>
        ))}
      </div>
      ) : events.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <ListChecks className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Events Found</h3>
          <p className="text-muted-foreground">Click "Add New Event" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg bg-card">
              {event.imageUrl && (
                <div className="relative aspect-video w-full">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="event image"
                  />
                </div>
              )}
               {!event.imageUrl && (
                 <div className="relative aspect-video w-full bg-secondary/30 flex items-center justify-center">
                    <CalendarClock className="h-16 w-16 text-muted-foreground" />
                 </div>
               )}
              <CardHeader className="pb-2">
                <CardTitle className="font-headline text-xl text-primary">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow pb-3 space-y-2">
                 <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarClock className="mr-2 h-4 w-4 flex-shrink-0" />
                  {formatDate(event.date)}
                </div>
                {event.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                    {event.location}
                  </div>
                )}
                <CardDescription className="text-foreground/80 line-clamp-3">
                  {event.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="flex w-full space-x-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditEvent(event)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex-1">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event "{event.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteEvent(event.id!, event.title)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

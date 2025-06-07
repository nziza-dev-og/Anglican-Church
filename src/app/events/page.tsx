
"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EVENTS_COLLECTION } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { ChurchEvent } from "@/types";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { CalendarClock, MapPin, ListChecks } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function EventsPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <AppLayout>
      <PageTitle
        title="Church Events"
        subtitle="Stay updated with all our upcoming and past church events."
      />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden card-animated">
              <Skeleton className="aspect-video w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <ListChecks className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Events Found</h3>
          <p className="text-muted-foreground">There are currently no events scheduled. Please check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg card-animated bg-card animate-slide-in-up">
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
              <CardFooter>
                <Button asChild className="w-full btn-animated" variant="outline">
                  <Link href={`/events/${event.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

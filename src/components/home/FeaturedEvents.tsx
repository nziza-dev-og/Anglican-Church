"use client";
import type { ChurchEvent } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EVENTS_COLLECTION } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

const formatDate = (timestamp: Timestamp | Date) => {
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function FeaturedEvents() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsQuery = query(
          collection(db, EVENTS_COLLECTION),
          orderBy("date", "asc"),
          limit(3)
        );
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

  if (loading) {
    return (
      <section className="py-12 md:py-16">
        <h2 className="text-3xl font-headline font-semibold text-center mb-8 text-primary">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden card-animated">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    );
  }
  
  if (events.length === 0 && !loading) {
    return (
       <section className="py-12 md:py-16">
        <h2 className="text-3xl font-headline font-semibold text-center mb-8 text-primary">Featured Events</h2>
        <p className="text-center text-muted-foreground">No upcoming events at the moment. Please check back later.</p>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-secondary/30 rounded-lg mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-headline font-semibold text-center mb-10 text-primary">
          Upcoming Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg card-animated bg-card animate-slide-in-up">
              {event.imageUrl && (
                <div className="relative h-56 w-full">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="event gathering"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="font-headline text-xl text-primary">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {formatDate(event.date)}
                </div>
                {event.location && (
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                )}
                <CardDescription className="line-clamp-3 text-foreground/80">
                  {event.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild variant="link" className="text-primary p-0 hover:text-accent">
                  <Link href={`/events/${event.id}`}>Learn More &rarr;</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {events.length > 0 && (
           <div className="text-center mt-10">
            <Button asChild size="lg" className="btn-animated">
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
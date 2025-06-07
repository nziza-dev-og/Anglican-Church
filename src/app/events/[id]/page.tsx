
"use client";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EVENTS_COLLECTION } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { ChurchEvent } from "@/types";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { ArrowLeft, CalendarClock, MapPin, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<ChurchEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      const fetchEvent = async () => {
        setLoading(true);
        setError(null);
        try {
          const eventDocRef = doc(db, EVENTS_COLLECTION, eventId);
          const docSnap = await getDoc(eventDocRef);
          if (docSnap.exists()) {
            setEvent({ id: docSnap.id, ...docSnap.data() } as ChurchEvent);
          } else {
            setError("Event not found.");
          }
        } catch (err) {
          console.error("Error fetching event:", err);
          setError("Failed to load event details.");
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="w-full h-72 md:h-96 mb-6 rounded-lg" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-5 w-1/2 mb-2" />
          <Skeleton className="h-5 w-1/3 mb-4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto text-center py-10">
            <Info className="mx-auto h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-semibold text-destructive mb-2">{error}</h2>
            <p className="text-muted-foreground mb-6">The event you are looking for might have been removed or the link is incorrect.</p>
            <Button onClick={() => router.push('/events')} className="btn-animated">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Events
            </Button>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    // This case should ideally be covered by error state, but as a fallback:
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto text-center py-10">
          <p className="text-muted-foreground">Event details are unavailable.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6 btn-animated">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>

        {event.imageUrl && (
          <div className="relative w-full h-72 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={event.imageUrl}
              alt={event.title}
              layout="fill"
              objectFit="cover"
              data-ai-hint="event banner"
            />
          </div>
        )}
         {!event.imageUrl && (
             <div className="relative w-full h-72 md:h-96 mb-8 rounded-lg overflow-hidden shadow-lg bg-secondary/30 flex items-center justify-center">
                <CalendarClock className="h-24 w-24 text-muted-foreground" />
             </div>
         )}

        <Card className="card-animated">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-headline text-primary">{event.title}</CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-muted-foreground mt-2">
                <div className="flex items-center">
                    <CalendarClock className="mr-2 h-5 w-5 text-accent" />
                    <span>{formatDate(event.date)}</span>
                </div>
                {event.location && (
                <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-accent" />
                    <span>{event.location}</span>
                </div>
                )}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UNIONS_COLLECTION } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { ChurchUnion } from "@/types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Handshake, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UnionsPage() {
  const [unions, setUnions] = useState<ChurchUnion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnions = async () => {
      setLoading(true);
      try {
        const unionsQuery = query(collection(db, UNIONS_COLLECTION), orderBy("name", "asc"));
        const querySnapshot = await getDocs(unionsQuery);
        const fetchedUnions: ChurchUnion[] = [];
        querySnapshot.forEach((doc) => {
          fetchedUnions.push({ id: doc.id, ...doc.data() } as ChurchUnion);
        });
        setUnions(fetchedUnions);
      } catch (error) {
        console.error("Error fetching unions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUnions();
  }, []);

  return (
    <AppLayout>
      <PageTitle
        title="Church Unions"
        subtitle="Learn about our Mothers Union, Fathers Union, and other fellowship groups."
      />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="overflow-hidden card-animated">
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : unions.length === 0 ? (
        <div className="text-center py-12">
          <Handshake className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Unions Found</h3>
          <p className="text-muted-foreground">Information about our church unions will be available soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {unions.map((union) => (
            <Card key={union.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg card-animated bg-card animate-slide-in-up">
              <div className="relative h-56 w-full bg-secondary/30 flex items-center justify-center">
                 <Image src="https://placehold.co/600x400.png" alt={union.name} layout="fill" objectFit="cover" data-ai-hint="union meeting" />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="font-headline text-2xl text-primary">{union.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-foreground/80 line-clamp-4 mb-2">
                  {union.description || "No description available."}
                </p>
                 <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {/* Placeholder for member count or admin info */}
                  Fostering fellowship and spiritual growth.
                </div>
              </CardContent>
              {/* <CardFooter>
                <Button asChild variant="link" className="text-primary p-0 hover:text-accent">
                  <Link href={`/unions/${union.id}`}>Learn More &rarr;</Link>
                </Button>
              </CardFooter> */}
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

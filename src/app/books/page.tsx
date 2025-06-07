
"use client";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BOOKS_COLLECTION } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Book } from "@/types";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { BookOpen, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const booksQuery = query(collection(db, BOOKS_COLLECTION), orderBy("uploadedAt", "desc"));
        const querySnapshot = await getDocs(booksQuery);
        const fetchedBooks: Book[] = [];
        querySnapshot.forEach((doc) => {
          fetchedBooks.push({ id: doc.id, ...doc.data() } as Book);
        });
        setBooks(fetchedBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <AppLayout>
      <PageTitle
        title="Digital Library"
        subtitle="Explore our collection of Christian literature and resources."
      />
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden card-animated">
              <Skeleton className="aspect-[3/4] w-full" />
              <CardHeader className="pt-4 pb-2">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-3">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Books Available</h3>
          <p className="text-muted-foreground">Our digital library is currently empty. Please check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <Card key={book.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg card-animated bg-card animate-slide-in-up">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={book.coverImageUrl || "https://placehold.co/300x400.png"}
                  alt={book.title}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="book cover"
                />
              </div>
              <CardHeader className="pt-4 pb-2">
                <CardTitle className="font-body text-lg text-primary line-clamp-2">{book.title}</CardTitle>
                {book.author && (
                  <CardDescription className="text-xs text-muted-foreground">By {book.author}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow pb-3">
                <p className="text-sm text-foreground/80 line-clamp-3">
                  {book.description || "No description available."}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full btn-animated" size="sm">
                  <Link href={book.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

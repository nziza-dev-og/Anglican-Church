
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BOOKS_COLLECTION, USER_ROLES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Book } from "@/types";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { BookOpen, Download, PlusCircle, Trash2, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import BookForm from "@/components/admin/BookForm";
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

export default function AdminBooksPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  useEffect(() => {
    if (!authLoading && userProfile && 
        (userProfile.role !== USER_ROLES.CHURCH_ADMIN && userProfile.role !== USER_ROLES.SUPER_ADMIN)) {
      router.push("/dashboard"); 
    }
  }, [userProfile, authLoading, router]);

  const fetchBooks = async () => {
    setLoadingData(true);
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
      toast({ title: "Error", description: "Could not fetch books.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (userProfile && (userProfile.role === USER_ROLES.CHURCH_ADMIN || userProfile.role === USER_ROLES.SUPER_ADMIN)) {
      fetchBooks();
    }
  }, [userProfile]);

  const handleBookSaved = (savedBook: Book) => {
    if (editingBook) {
      setBooks(prevBooks => prevBooks.map(b => b.id === savedBook.id ? savedBook : b));
    } else {
      setBooks(prevBooks => [savedBook, ...prevBooks]);
    }
    setShowForm(false);
    setEditingBook(null);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowForm(true);
  };
  
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) { // If form was open and is now closing
      setEditingBook(null); // Reset editing state
    }
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    try {
      await deleteDoc(doc(db, BOOKS_COLLECTION, bookId));
      setBooks(prevBooks => prevBooks.filter(b => b.id !== bookId));
      toast({ title: "Book Deleted", description: `"${bookTitle}" has been removed.` });
    } catch (error) {
      console.error("Error deleting book:", error);
      toast({ title: "Error", description: "Could not delete book.", variant: "destructive"});
    }
  };

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title="Manage Books" />
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
        title="Manage Books"
        subtitle="Add, edit, or remove books from the digital library."
        actions={
          <Button onClick={toggleForm} className="btn-animated">
            <PlusCircle className="mr-2 h-5 w-5" /> {showForm ? "Cancel" : "Add New Book"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8 card-animated">
          <CardHeader>
            <CardTitle className="font-body">{editingBook ? "Edit Book" : "Add a New Book"}</CardTitle>
          </CardHeader>
          <CardContent>
            <BookForm onBookAdded={handleBookSaved} editingBook={editingBook} />
          </CardContent>
        </Card>
      )}

      {loadingData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden"><Skeleton className="aspect-[3/4] w-full" /></Card>
          ))}
        </div>
      ) : books.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Books in Library</h3>
          <p className="text-muted-foreground">Click "Add New Book" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {books.map((book) => (
            <Card key={book.id} className="flex flex-col overflow-hidden shadow-lg rounded-lg bg-card">
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
                <CardTitle className="font-body text-base text-primary line-clamp-2">{book.title}</CardTitle>
                {book.author && (
                  <CardDescription className="text-xs text-muted-foreground">By {book.author}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow pb-1 text-xs">
                 Category: {book.category || 'N/A'}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 !pt-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={book.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Link>
                </Button>
                <div className="flex w-full space-x-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditBook(book)}>
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
                          This action cannot be undone. This will permanently delete the book "{book.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteBook(book.id!, book.title)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

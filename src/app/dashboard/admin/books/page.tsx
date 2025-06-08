
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
import { useEffect, useState, useCallback } from "react";
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
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminBooksPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [books, setBooks] = useState<Book[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const fetchBooks = useCallback(async () => {
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
      toast({ title: t('general.error.unexpected'), description: t('admin.books.toast.error.fetch'), variant: "destructive" });
      setBooks([]);
    } finally {
      setLoadingData(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (authLoading) {
      // DashboardLayout will show a spinner. Page keeps its loadingData true.
      return;
    }

    if (!userProfile) {
      setLoadingData(false); // No user, so no data to load for this admin page
      // router.push('/auth/login'); // Should be handled by DashboardLayout or AuthContext
      return;
    }

    const isAuthorized = userProfile.role === USER_ROLES.CHURCH_ADMIN || userProfile.role === USER_ROLES.SUPER_ADMIN;

    if (!isAuthorized) {
      router.push("/dashboard");
      setLoadingData(false); // Not authorized, so no data to load for this page
      return;
    }

    fetchBooks(); // Authorized, fetch data. fetchBooks will manage setLoadingData.
  }, [authLoading, userProfile, router, fetchBooks]);


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
    if (showForm) { 
      setEditingBook(null); 
    }
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    try {
      await deleteDoc(doc(db, BOOKS_COLLECTION, bookId));
      setBooks(prevBooks => prevBooks.filter(b => b.id !== bookId));
      toast({ title: t('admin.books.toast.deleted.title'), description: `"${bookTitle}" ${t('admin.books.toast.deleted.description')}` });
    } catch (error) {
      console.error("Error deleting book:", error);
      toast({ title: t('general.error.unexpected'), description: t('admin.books.toast.error.delete'), variant: "destructive"});
    }
  };

  // If auth context is loading, DashboardLayout shows a spinner.
  // This page waits for auth context to resolve before deciding to show its own content/skeletons.
  // If authLoading is true, this component's render might be too early to show specific skeletons,
  // so we rely on DashboardLayout's spinner, then this page's `loadingData`.

  return (
    <div>
      <PageTitle
        title={t('admin.books.title')}
        subtitle={t('admin.books.subtitle')}
        actions={
          <Button onClick={toggleForm} className="btn-animated">
            <PlusCircle className="mr-2 h-5 w-5" /> {showForm ? t('general.cancel') : t('admin.books.addNew')}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-8 card-animated">
          <CardHeader>
            <CardTitle className="font-body">{editingBook ? t('admin.books.form.editTitle') : t('admin.books.form.addTitle')}</CardTitle>
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
          <h3 className="text-xl font-semibold text-foreground mb-2">{t('admin.books.empty.title')}</h3>
          <p className="text-muted-foreground">{t('admin.books.empty.description')}</p>
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
                  <CardDescription className="text-xs text-muted-foreground">{t('general.by')} {book.author}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow pb-1 text-xs">
                 {t('general.category')} {book.category || 'N/A'}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 !pt-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={book.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" /> {t('general.download')}
                  </Link>
                </Button>
                <div className="flex w-full space-x-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditBook(book)}>
                    <Edit className="mr-2 h-4 w-4" /> {t('general.edit')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" /> {t('general.delete')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.books.delete.confirm.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('admin.books.delete.confirm.description')} "{book.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteBook(book.id!, book.title)}>
                          {t('general.delete')}
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

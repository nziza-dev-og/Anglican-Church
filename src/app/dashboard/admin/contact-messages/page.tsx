
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTACT_MESSAGES_COLLECTION, USER_ROLES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { ContactMessage } from "@/types";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Mail, Trash2, CheckCircle, XCircle, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from 'date-fns';

export default function AdminContactMessagesPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // To show loading on specific action buttons

  useEffect(() => {
    if (!authLoading && userProfile &&
        (userProfile.role !== USER_ROLES.CHURCH_ADMIN && userProfile.role !== USER_ROLES.SUPER_ADMIN)) {
      router.push("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  const fetchMessages = useCallback(async () => {
    setLoadingData(true);
    try {
      const messagesQuery = query(collection(db, CONTACT_MESSAGES_COLLECTION), orderBy("submittedAt", "desc"));
      const querySnapshot = await getDocs(messagesQuery);
      const fetchedMessages: ContactMessage[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as ContactMessage);
      });
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({ title: t('general.error.title'), description: t('admin.contactMessages.toast.error.fetch'), variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (userProfile && (userProfile.role === USER_ROLES.CHURCH_ADMIN || userProfile.role === USER_ROLES.SUPER_ADMIN)) {
      fetchMessages();
    }
  }, [userProfile, fetchMessages]);
  
  const handleToggleReadStatus = async (message: ContactMessage) => {
    if (!message.id) return;
    setActionLoading(`read-${message.id}`);
    try {
      const messageDocRef = doc(db, CONTACT_MESSAGES_COLLECTION, message.id);
      await updateDoc(messageDocRef, { isRead: !message.isRead });
      setMessages(prevMessages => prevMessages.map(msg => 
        msg.id === message.id ? { ...msg, isRead: !msg.isRead } : msg
      ));
      toast({ title: t('general.success'), description: message.isRead ? t('admin.contactMessages.toast.markedUnread') : t('admin.contactMessages.toast.markedRead') });
    } catch (error) {
      console.error("Error updating message status:", error);
      toast({ title: t('general.error.title'), description: t('admin.contactMessages.toast.error.update'), variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    setActionLoading(`delete-${messageId}`);
    try {
      await deleteDoc(doc(db, CONTACT_MESSAGES_COLLECTION, messageId));
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      toast({ title: t('general.success'), description: t('admin.contactMessages.toast.deleted') });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({ title: t('general.error.title'), description: t('admin.contactMessages.toast.error.delete'), variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
  };

  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'PPP p'); // e.g., Jun 22, 2024 10:30 AM
  };

  if (authLoading || (!userProfile && !authLoading)) {
    return (
      <div>
        <PageTitle title={t('admin.contactMessages.pageTitle')} />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  return (
    <div>
      <PageTitle
        title={t('admin.contactMessages.pageTitle')}
        subtitle={t('admin.contactMessages.pageSubtitle')}
      />
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.contactMessages.listTitle')}</CardTitle>
          <CardDescription>{t('admin.contactMessages.total')} {messages.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
             <div className="text-center py-12">
              <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('admin.contactMessages.empty.title')}</h3>
              <p className="text-muted-foreground">{t('admin.contactMessages.empty.description')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.contactMessages.table.name')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('admin.contactMessages.table.email')}</TableHead>
                  <TableHead>{t('admin.contactMessages.table.subject')}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t('admin.contactMessages.table.date')}</TableHead>
                  <TableHead>{t('admin.contactMessages.table.status')}</TableHead>
                  <TableHead className="text-right">{t('admin.contactMessages.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg) => (
                  <TableRow key={msg.id} className={!msg.isRead ? 'font-semibold bg-secondary/20' : ''}>
                    <TableCell>{msg.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{msg.email}</TableCell>
                    <TableCell className="max-w-xs truncate">{msg.subject}</TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(msg.submittedAt)}</TableCell>
                    <TableCell>
                      <Badge variant={msg.isRead ? "secondary" : "default"}>
                        {msg.isRead ? t('admin.contactMessages.status.read') : t('admin.contactMessages.status.unread')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewMessage(msg)} title={t('admin.contactMessages.actions.view')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleReadStatus(msg)} title={msg.isRead ? t('admin.contactMessages.actions.markAsUnread') : t('admin.contactMessages.actions.markAsRead')} disabled={actionLoading === `read-${msg.id}`}>
                        {actionLoading === `read-${msg.id}` ? <Loader2 className="h-4 w-4 animate-spin"/> : msg.isRead ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                       <Button asChild variant="ghost" size="icon" title={t('admin.contactMessages.actions.reply')}>
                        <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title={t('admin.contactMessages.actions.delete')} disabled={actionLoading === `delete-${msg.id}`}>
                             {actionLoading === `delete-${msg.id}` ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('admin.contactMessages.delete.confirm.title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('admin.contactMessages.delete.confirm.description')} "{msg.subject}" {t('general.by').toLowerCase()} {msg.name}? {t('general.confirmation.cannotBeUndone')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMessage(msg.id!)} className={buttonVariants({variant: "destructive"})}>
                              {t('general.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedMessage && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('admin.contactMessages.viewMessage.title')}: {selectedMessage.subject}</DialogTitle>
              <DialogDescription>
                {t('general.by')} {selectedMessage.name} ({selectedMessage.email}) - {formatDate(selectedMessage.submittedAt)}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] my-4 pr-6">
              <p className="whitespace-pre-wrap text-sm">{selectedMessage.message}</p>
            </ScrollArea>
            <DialogFooter className="sm:justify-start">
               <Button asChild variant="default">
                <a href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}>
                  <Mail className="mr-2 h-4 w-4" /> {t('admin.contactMessages.actions.reply')}
                </a>
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsViewDialogOpen(false)}>
                {t('general.cancel')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

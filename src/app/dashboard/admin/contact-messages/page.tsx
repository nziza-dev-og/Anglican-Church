
"use client";
import PageTitle from "@/components/shared/PageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTACT_MESSAGES_COLLECTION, USER_ROLES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { ContactMessage } from "@/types";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, Timestamp, onSnapshot } from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDescriptionComponent, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setLoadingData(true); // Still waiting for auth info
      return;
    }

    if (!userProfile) {
      setLoadingData(false); // No user, nothing to load for this admin page
      // router.push('/auth/login'); // Should be handled by DashboardLayout
      return;
    }
    const isAuthorized = userProfile.role === USER_ROLES.CHURCH_ADMIN || userProfile.role === USER_ROLES.SUPER_ADMIN;

    if (!isAuthorized) {
      router.push("/dashboard");
      setLoadingData(false);
      return;
    }
    
    setLoadingData(true); // Start loading page-specific data
    const messagesQuery = query(collection(db, CONTACT_MESSAGES_COLLECTION), orderBy("submittedAt", "desc"));
    
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const fetchedMessages: ContactMessage[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as ContactMessage);
      });
      setMessages(fetchedMessages);
      setLoadingData(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      toast({ title: t('general.error.title'), description: t('admin.contactMessages.toast.error.fetch'), variant: "destructive" });
      setMessages([]); // Clear messages on error
      setLoadingData(false);
    });

    return () => unsubscribe(); // Cleanup listener on component unmount

  }, [authLoading, userProfile, router, t, toast]); // Dependencies for the effect
  
  const handleToggleReadStatus = async (message: ContactMessage) => {
    if (!message.id) return;
    setActionLoading(`read-${message.id}`);
    try {
      const messageDocRef = doc(db, CONTACT_MESSAGES_COLLECTION, message.id);
      await updateDoc(messageDocRef, { isRead: !message.isRead });
      // setMessages will be updated by the onSnapshot listener
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
      // setMessages will be updated by the onSnapshot listener
      toast({ title: t('general.success'), description: t('admin.contactMessages.toast.deleted') });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({ title: t('general.error.title'), description: t('admin.contactMessages.toast.error.delete'), variant: "destructive" });
    } finally {
      setActionLoading(null);
      setSelectedMessage(null); 
      setIsViewDialogOpen(false);
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    if (!message.isRead && message.id) {
        // Optimistically mark as read in UI, backend will confirm
        // This specific update will be handled by the Firestore listener if successful
        const messageDocRef = doc(db, CONTACT_MESSAGES_COLLECTION, message.id);
        updateDoc(messageDocRef, { isRead: true }).catch(error => {
            console.error("Error marking message as read on view:", error);
            // Potentially revert UI change or notify user
        });
    }
  };

  const formatDate = (timestamp: Timestamp | Date | undefined | string | number): string => {
    if (!timestamp) return t('general.notAvailableShort');
    try {
      let date: Date;
      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return 'Invalid Date Input';
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date'; 
      }
      return format(date, 'PPP p'); // Example: Jun 9, 2023, 3:30 PM
    } catch (e) {
      console.error("Error formatting date:", e, "Input was:", timestamp);
      return 'Date Error';
    }
  };
  
  // DashboardLayout handles global authLoading. This page shows skeletons if its specific data is loading.
  if (authLoading) { 
    return (
      <div>
        <PageTitle title={t('admin.contactMessages.pageTitle')} />
        <Card><CardHeader><Skeleton className="h-8 w-48" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
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
                {messages.map((msg) => {
                  let rowClass = 'hover:bg-muted/50';
                  if (!msg.isRead) {
                    rowClass = 'font-semibold bg-secondary/20 hover:bg-secondary/30';
                  }
                  return (
                    <TableRow key={msg.id!} className={rowClass}>
                      <TableCell onClick={() => handleViewMessage(msg)} style={{cursor: 'pointer'}}>{msg.name || t('general.notAvailableShort')}</TableCell>
                      <TableCell onClick={() => handleViewMessage(msg)} style={{cursor: 'pointer'}} className="hidden md:table-cell">{msg.email || t('general.notAvailableShort')}</TableCell>
                      <TableCell onClick={() => handleViewMessage(msg)} style={{cursor: 'pointer'}} className="max-w-xs truncate">{msg.subject || t('general.notAvailableShort')}</TableCell>
                      <TableCell onClick={() => handleViewMessage(msg)} style={{cursor: 'pointer'}} className="hidden lg:table-cell">{formatDate(msg.submittedAt)}</TableCell>
                      <TableCell onClick={() => handleViewMessage(msg)} style={{cursor: 'pointer'}}>
                        <Badge variant={msg.isRead ? "secondary" : "default"}>
                          {msg.isRead ? t('admin.contactMessages.status.read') : t('admin.contactMessages.status.unread')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); handleViewMessage(msg);}} title={t('admin.contactMessages.actions.view')}>
                           <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); handleToggleReadStatus(msg);}} title={msg.isRead ? t('admin.contactMessages.actions.markAsUnread') : t('admin.contactMessages.actions.markAsRead')} disabled={actionLoading === `read-${msg.id}`}>
                          {actionLoading === `read-${msg.id}` ? <Loader2 className="h-4 w-4 animate-spin"/> : msg.isRead ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                         <Button asChild variant="ghost" size="icon" title={t('admin.contactMessages.actions.reply')} onClick={(e) => e.stopPropagation()}>
                          <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || '')}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                        <AlertDialog onOpenChange={(open) => { if(!open) setSelectedMessage(null);}}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title={t('admin.contactMessages.actions.delete')} disabled={actionLoading === `delete-${msg.id}`} onClick={(e) => {e.stopPropagation(); setSelectedMessage(msg); }}>
                               {actionLoading === `delete-${msg.id}` ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4 text-destructive" />}
                            </Button>
                          </AlertDialogTrigger>
                          {selectedMessage && selectedMessage.id === msg.id && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('admin.contactMessages.delete.confirm.title')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('general.confirmation.cannotBeUndone')} {t('admin.contactMessages.delete.confirm.description')} "{msg.subject || t('general.notAvailableShort')}" {t('general.by').toLowerCase()} {msg.name || t('general.notAvailableShort')}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMessage(msg.id!)} className={buttonVariants({variant: "destructive"})}>
                                {t('general.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                          )}
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedMessage && (
        <Dialog open={isViewDialogOpen} onOpenChange={(open) => {setIsViewDialogOpen(open); if (!open) setSelectedMessage(null);}}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('admin.contactMessages.viewMessage.title')}: {selectedMessage.subject || t('general.notAvailableShort')}</DialogTitle>
              <DialogDescriptionComponent>
                {t('general.by')} {selectedMessage.name || t('general.notAvailableShort')} ({selectedMessage.email || t('general.notAvailableShort')}) - {formatDate(selectedMessage.submittedAt)}
              </DialogDescriptionComponent>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] my-4 pr-6">
              <p className="whitespace-pre-wrap text-sm">{selectedMessage.message || t('general.noDescription')}</p>
            </ScrollArea>
            <DialogFooter className="sm:justify-start space-x-2">
               <Button asChild variant="default">
                <a href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || '')}`}>
                  <Mail className="mr-2 h-4 w-4" /> {t('admin.contactMessages.actions.reply')}
                </a>
              </Button>
              <Button type="button" variant="secondary" onClick={() => {setIsViewDialogOpen(false); setSelectedMessage(null);}}>
                {t('general.cancel')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

    
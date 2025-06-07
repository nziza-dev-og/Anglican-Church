
"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { CHAT_MESSAGES_COLLECTION } from "@/lib/constants";
import type { ChatMessage } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { Send, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // For relative timestamps

export default function ChatPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/chat');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    setLoadingMessages(true);
    const q = query(collection(db, CHAT_MESSAGES_COLLECTION), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    }, (error) => {
      console.error("Error fetching chat messages:", error);
      setLoadingMessages(false);
      // Optionally, show a toast message for the error
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !userProfile) return;

    setSendingMessage(true);
    try {
      await addDoc(collection(db, CHAT_MESSAGES_COLLECTION), {
        roomId: 'general', // For a general chat room
        senderUid: user.uid,
        senderName: userProfile.displayName || t('general.anonymousUser'),
        senderPhotoURL: userProfile.photoURL || null,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally, show a toast message for the error
    } finally {
      setSendingMessage(false);
    }
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const formatTimestamp = (timestamp: Timestamp | null | undefined): string => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    } catch (e) {
      return 'just now'; // Fallback for invalid or server timestamps not yet converted
    }
  };


  if (authLoading) {
    return (
      <AppLayout>
        <PageTitle title={t('chat.title')} subtitle={t('general.loading')} />
        <Skeleton className="h-96 w-full" />
      </AppLayout>
    );
  }

  if (!user) {
     // This case should be handled by the redirect, but good to have a fallback UI
    return (
      <AppLayout>
        <PageTitle title={t('chat.title')} subtitle={t('chat.notAuthenticated')} />
        <div className="text-center">
          <p>{t('chat.notAuthenticated')}</p>
          <Button onClick={() => router.push('/auth/login?redirect=/chat')} className="mt-4">
            {t('auth.login')}
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTitle title={t('chat.title')} subtitle={t('chat.subtitle')} />
      <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px] border rounded-lg shadow-md bg-card">
        <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
          {loadingMessages ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex items-start gap-2.5 ${i % 2 === 0 ? '' : 'justify-end'}`}>
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
                <MessageSquare className="w-16 h-16 text-muted-foreground mb-4"/>
                <p className="text-muted-foreground">{t('chat.noMessages')}</p>
            </div>
          ) : (
            messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex items-end gap-2.5 ${msg.senderUid === user.uid ? 'justify-end' : ''}`}
              >
                {msg.senderUid !== user.uid && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.senderPhotoURL || undefined} alt={msg.senderName || 'User'} />
                    <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`flex flex-col w-full max-w-[320px] leading-1.5 p-3 border-border rounded-xl ${
                    msg.senderUid === user.uid 
                      ? 'bg-primary text-primary-foreground rounded-br-none' 
                      : 'bg-muted text-foreground rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                      <span className={`text-xs font-semibold ${msg.senderUid === user.uid ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {msg.senderName || t('general.anonymousUser')}
                      </span>
                      <span className={`text-xs font-normal ${msg.senderUid === user.uid ? 'text-primary-foreground/70' : 'text-muted-foreground/80'}`}>
                        {formatTimestamp(msg.timestamp)}
                      </span>
                  </div>
                  <p className="text-sm font-normal whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                 {msg.senderUid === user.uid && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.senderPhotoURL || undefined} alt={msg.senderName || 'User'} />
                    <AvatarFallback>{getInitials(msg.senderName)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('chat.sendMessagePlaceholder')}
            className="flex-grow"
            disabled={sendingMessage || authLoading || !userProfile}
          />
          <Button type="submit" disabled={!newMessage.trim() || sendingMessage || authLoading || !userProfile}>
            <Send className="h-4 w-4 mr-2" />
            {t('chat.sendButton')}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}

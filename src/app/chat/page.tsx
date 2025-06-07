
"use client";
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/shared/PageTitle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { CHAT_MESSAGES_COLLECTION, USERS_COLLECTION } from "@/lib/constants";
import type { ChatMessage, UserProfile } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, where, getDocs } from "firebase/firestore";
import { Send, MessageSquare, UserSearch, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createChatRoomId } from '@/lib/utils'; // Import the new utility

export default function ChatPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false); // True when switching rooms
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/chat');
    }
  }, [user, authLoading, router]);

  // Fetch all users once
  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const usersQuery = query(collection(db, USERS_COLLECTION), where("uid", "!=", user.uid), orderBy("displayName", "asc"));
        const querySnapshot = await getDocs(usersQuery);
        const fetchedUsersList: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          fetchedUsersList.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        setAllUsers(fetchedUsersList);
        setFilteredUsers(fetchedUsersList);
      } catch (error) {
        console.error("Error fetching users:", error);
        // Optionally show a toast
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [user]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(allUsers);
    } else {
      setFilteredUsers(
        allUsers.filter(u => 
          u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, allUsers]);

  // Message listener based on currentRoomId
  useEffect(() => {
    if (!currentRoomId || !user) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const q = query(collection(db, CHAT_MESSAGES_COLLECTION), where("roomId", "==", currentRoomId), orderBy('timestamp', 'asc'));
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
    });

    return () => unsubscribe();
  }, [currentRoomId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectUser = (targetUser: UserProfile) => {
    if (user && targetUser.uid !== user.uid) {
      setSelectedUser(targetUser);
      const roomId = createChatRoomId(user.uid, targetUser.uid);
      setCurrentRoomId(roomId);
      setMessages([]); // Clear previous messages
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !userProfile || !currentRoomId || !selectedUser) return;

    setSendingMessage(true);
    try {
      await addDoc(collection(db, CHAT_MESSAGES_COLLECTION), {
        roomId: currentRoomId,
        senderUid: user.uid,
        senderName: userProfile.displayName || t('general.anonymousUser'),
        senderPhotoURL: userProfile.photoURL || null,
        receiverUid: selectedUser.uid, // Optionally store receiver for easier queries/notifications later
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  const formatTimestamp = (timestamp: Timestamp | null | undefined): string => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    } catch (e) { return 'just now'; }
  };

  if (authLoading) {
    return ( <AppLayout> <PageTitle title={t('chat.title')} subtitle={t('general.loading')} /> <Skeleton className="h-96 w-full" /> </AppLayout> );
  }

  if (!user) {
    return ( <AppLayout> <PageTitle title={t('chat.title')} subtitle={t('chat.notAuthenticated')} /> <div className="text-center"> <p>{t('chat.notAuthenticated')}</p> <Button onClick={() => router.push('/auth/login?redirect=/chat')} className="mt-4"> {t('auth.login')} </Button> </div> </AppLayout> );
  }

  return (
    <AppLayout>
      <PageTitle title={t('chat.title')} subtitle={t('chat.subtitle')} />
      <div className="flex flex-col md:flex-row h-[calc(100vh-220px)] max-h-[700px] border rounded-lg shadow-md bg-card">
        {/* User List Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-b md:border-b-0 md:border-r">
          <div className="p-4 border-b">
            <div className="relative">
              <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('chat.searchUsersPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>
          <ScrollArea className="h-[200px] md:h-full">
            {loadingUsers ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Users className="mx-auto h-10 w-10 mb-2" />
                {t('chat.noUsersFound')}
              </div>
            ) : (
              filteredUsers.map(chatUser => (
                <Button
                  key={chatUser.uid}
                  variant="ghost"
                  className={`w-full justify-start p-3 h-auto rounded-none ${selectedUser?.uid === chatUser.uid ? 'bg-muted' : ''}`}
                  onClick={() => handleSelectUser(chatUser)}
                >
                  <Avatar className="h-9 w-9 mr-3">
                    <AvatarImage src={chatUser.photoURL || undefined} alt={chatUser.displayName || 'User'} />
                    <AvatarFallback>{getInitials(chatUser.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm text-foreground">{chatUser.displayName || t('general.anonymousUser')}</span>
                    <span className="text-xs text-muted-foreground">{chatUser.email}</span>
                  </div>
                </Button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-grow flex flex-col">
          {!selectedUser ? (
            <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground p-4">
              <MessageSquare className="h-16 w-16 mb-4" />
              <p className="text-lg">{t('chat.selectUserPrompt')}</p>
            </div>
          ) : (
            <>
              <div className="p-3 border-b bg-card">
                <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={selectedUser.photoURL || undefined} alt={selectedUser.displayName || 'User'}/>
                        <AvatarFallback>{getInitials(selectedUser.displayName)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium text-foreground">{selectedUser.displayName || t('general.anonymousUser')}</h3>
                </div>
              </div>
              <ScrollArea className="flex-grow p-4 space-y-4 bg-background/50">
                {loadingMessages ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`flex items-start gap-2.5 ${i % 2 === 0 ? '' : 'justify-end'}`}>
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex flex-col gap-1"> <Skeleton className="h-4 w-20" /> <Skeleton className="h-10 w-48" /> </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mb-2"/>
                    <p>{t('chat.noMessagesYetWith', { userName: selectedUser.displayName || t('general.anonymousUser') })}</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2.5 ${msg.senderUid === user.uid ? 'justify-end' : ''}`}>
                      {msg.senderUid !== user.uid && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.senderPhotoURL || selectedUser.photoURL || undefined} alt={msg.senderName || 'User'} />
                          <AvatarFallback>{getInitials(msg.senderName || selectedUser.displayName)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col w-full max-w-xs sm:max-w-sm md:max-w-md leading-1.5 p-3 border-border rounded-xl ${ msg.senderUid === user.uid ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                            <span className={`text-xs font-semibold ${msg.senderUid === user.uid ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {msg.senderName || (msg.senderUid === user.uid ? userProfile?.displayName : selectedUser.displayName) || t('general.anonymousUser')}
                            </span>
                            <span className={`text-xs font-normal ${msg.senderUid === user.uid ? 'text-primary-foreground/70' : 'text-muted-foreground/80'}`}>
                              {formatTimestamp(msg.timestamp)}
                            </span>
                        </div>
                        <p className="text-sm font-normal whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                      {msg.senderUid === user.uid && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.senderPhotoURL || userProfile?.photoURL || undefined} alt={msg.senderName || 'User'} />
                          <AvatarFallback>{getInitials(msg.senderName || userProfile?.displayName)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2 bg-card">
                <Input
                  type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('chat.sendMessagePlaceholder')}
                  className="flex-grow"
                  disabled={sendingMessage || authLoading || !userProfile || loadingMessages}
                />
                <Button type="submit" disabled={!newMessage.trim() || sendingMessage || authLoading || !userProfile || loadingMessages}>
                  <Send className="h-4 w-4 mr-2" />
                  {t('chat.sendButton')}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

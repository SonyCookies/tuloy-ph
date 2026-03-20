'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'react-hot-toast';

type NotificationContextType = {
  unreadCount: number;
  markAsRead: (inquiryId: string) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  markAsRead: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Use refs to avoid continuous subscription recreations
  const userInquiriesRef = useRef<string[]>([]);

  const fetchUnreadCount = useCallback(async (uid: string) => {
    try {
      // Use quotes for string IDs in .or() filters
      const { data: inquiries } = await supabase
        .from('Inquiries')
        .select('id')
        .or(`user_id.eq."${uid}",owner_id.eq."${uid}"`);

      if (!inquiries) return;
      const inquiryIds = inquiries.map(i => i.id);
      userInquiriesRef.current = inquiryIds;

      if (inquiryIds.length === 0) {
        setUnreadCount(0);
        return;
      }

      const { count: msgCount } = await supabase
        .from('Messages')
        .select('*', { count: 'exact', head: true })
        .in('inquiry_id', inquiryIds)
        .neq('sender_id', uid)
        .eq('is_read', false);
        
      const { count: vsCountRecv } = await supabase
        .from('VisitSchedule')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', uid)
        .eq('is_read', false);
        
      const { count: vsCountSender } = await supabase
        .from('VisitSchedule')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', uid)
        .neq('status', 'pending')
        .eq('is_read', false);

      setUnreadCount((msgCount || 0) + (vsCountRecv || 0) + (vsCountSender || 0));
    } catch (e) {
      console.error('Error fetching unread count:', e);
    }
  }, []);

  useEffect(() => {
    const initNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      console.log('Initializing notifications for user:', user.id);
      setUserId(user.id);
      await fetchUnreadCount(user.id);

      // Listen to Global Messages
      const msgChannel = supabase.channel('global-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'Messages',
        }, (payload: any) => {
          const msg = payload.new;
          if (msg.sender_id !== user.id && userInquiriesRef.current.includes(msg.inquiry_id)) {
            fetchUnreadCount(user.id);
            // Toasts removed per user request
          }
        })
        .subscribe();

      // Listen to Global VisitSchedules
      const vsChannel = supabase.channel('global-visits')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'VisitSchedule'
        }, (payload: any) => {
          const row = payload.new || payload.old;
          if (row && (row.receiver_id === user.id || row.sender_id === user.id)) {
            fetchUnreadCount(user.id);
            // Toasts removed per user request
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(msgChannel);
        supabase.removeChannel(vsChannel);
      };
    };

    initNotifications();
  }, [fetchUnreadCount]);

  const markAsRead = async (inquiryId: string) => {
    if (!userId) return;
    
    console.log('Marking as read for inquiry:', inquiryId);
    
    try {
      // Use a more inclusive update for is_read (handle false or null)
      const res1 = await supabase.from('Messages')
          .update({ is_read: true })
          .eq('inquiry_id', inquiryId)
          .neq('sender_id', userId)
          .or('is_read.eq.false,is_read.is.null');
          
      const res2 = await supabase.from('VisitSchedule')
          .update({ is_read: true })
          .eq('inquiry_id', inquiryId)
          .eq('receiver_id', userId)
          .or('is_read.eq.false,is_read.is.null');
          
      const res3 = await supabase.from('VisitSchedule')
          .update({ is_read: true })
          .eq('inquiry_id', inquiryId)
          .eq('sender_id', userId)
          .neq('status', 'pending')
          .or('is_read.eq.false,is_read.is.null');

      if (res1.error) console.error("Msg Update Error:", res1.error);
      if (res2.error) console.error("VS Recv Update Error:", res2.error);
      if (res3.error) console.error("VS Sender Update Error:", res3.error);

      // Force Immediate re-fetch then staggered re-fetch to ensure UI reflects DB state
      await fetchUnreadCount(userId);
      setTimeout(() => fetchUnreadCount(userId), 500);
      setTimeout(() => fetchUnreadCount(userId), 2000);
    } catch (e) {
      console.error("Failed marking read:", e);
    }
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, markAsRead }}>
      <Toaster position="top-center" toastOptions={{ 
         style: { borderRadius: '16px', background: '#333', color: '#fff', fontSize: '12px', fontWeight: 'bold' } 
      }} />
      {children}
    </NotificationContext.Provider>
  );
}

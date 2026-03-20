'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageSquare, 
  Search, 
  ArrowLeft,
  Mail,
  Phone,
  Send,
  ChevronRight,
  Home,
  Sparkles,
  Calendar,
  Clock,
  User,
  Circle
} from "lucide-react";
import ScheduleVisitModal from "@/app/components/ui/ScheduleVisitModal";
import SuccessModal from "@/app/components/ui/SuccessModal";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from "framer-motion";

import { Suspense } from "react";
import { useNotifications } from '@/app/components/providers/NotificationProvider';

export default function OwnerMessages() {
  return (
    <Suspense fallback={null}>
      <OwnerMessagesContent />
    </Suspense>
  );
}

function OwnerMessagesContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const { markAsRead } = useNotifications();
  const [messages, setMessages] = useState<any[]>([]);
  const [visitSchedules, setVisitSchedules] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [ownerData, setOwnerData] = useState<any>(null);
  const [view, setView] = useState<'inbox' | 'chat'>('inbox');
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState({ title: '', message: '' });
  const searchParams = useSearchParams();
  const inquiryIdFromUrl = searchParams.get('id');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<any[]>([]); // To track messages efficiently in intervals
  const visitSchedulesRef = useRef<any[]>([]);

  // Keep ref synced with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    visitSchedulesRef.current = visitSchedules;
  }, [visitSchedules]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (view === 'chat') {
       document.body.classList.add('hide-bottom-nav');
    } else {
       document.body.classList.remove('hide-bottom-nav');
    }
    return () => document.body.classList.remove('hide-bottom-nav');
  }, [view]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setOwnerData({
          id: user.id,
          name: user.user_metadata?.full_name || 'Owner',
        });

        const { data, error } = await supabase
          .from('Inquiries')
          .select('*, Dorm(images, name), User!user_id(email, mobile, name, image), Messages(sender_id, is_read, content, type, created_at, metadata), VisitSchedule(sender_id, receiver_id, is_read, status)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const transformed = (data || []).map(inq => {
          const sortedMessages = (inq.Messages || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const latestMessage = sortedMessages.length > 0 ? sortedMessages[0].content : inq.message;
          const isPendingProposal = sortedMessages.length > 0 && 
                                  sortedMessages[0].type === 'visit_proposal' && 
                                  sortedMessages[0].metadata?.status === 'pending';

          return {
            ...inq,
            dorm_image: inq.Dorm?.images?.[0] || null,
            dorm_name: inq.Dorm?.name,
            email: inq.User?.email,
            phone: inq.User?.mobile,
            user_name: inq.User?.name || inq.student_name,
            user_image: inq.User?.image,
            latest_message_content: isPendingProposal ? '📅 Visit Proposal' : latestMessage,
            latest_message_time: sortedMessages.length > 0 ? sortedMessages[0].created_at : inq.created_at,
            unread_count: (inq.Messages || []).filter((m: any) => !m.is_read && m.sender_id !== user.id).length +
                          (inq.VisitSchedule || []).filter((vs: any) => {
                             if (vs.is_read) return false;
                             if (vs.receiver_id === user.id) return true;
                             if (vs.sender_id === user.id && vs.status !== 'pending') return true;
                             return false;
                          }).length
          };
        });

        setInquiries(transformed);
      } catch (err) {
        console.error('Error fetching inquiries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Global listeners to update the inquiry list (sidebar) in real-time
    const msgChannel = supabase.channel('owner-sidebar-messages')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'Messages'
      }, () => fetchData())
      .subscribe();

    const vsChannel = supabase.channel('owner-sidebar-visits')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'VisitSchedule'
      }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(vsChannel);
    };
  }, []);

  // Handle inquiry selection from URL
  useEffect(() => {
    if (inquiryIdFromUrl && inquiries.length > 0) {
      const targetInquiry = inquiries.find(inq => inq.id === inquiryIdFromUrl);
      if (targetInquiry) {
        setSelectedInquiry(targetInquiry);
        setView('chat');
      }
    }
  }, [inquiryIdFromUrl, inquiries]);

  useEffect(() => {
    if (!selectedInquiry) return;
    
    markAsRead(selectedInquiry.id);

    // 1. Initial Fetch
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('Messages')
        .select('*')
        .eq('inquiry_id', selectedInquiry.id)
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };

    const fetchVisitSchedules = async () => {
      const { data } = await supabase
        .from('VisitSchedule')
        .select('*')
        .eq('inquiry_id', selectedInquiry.id)
        .order('created_at', { ascending: true });
      setVisitSchedules(data || []);
    };

    fetchMessages();
    fetchVisitSchedules();

    // 2. Resourceful Periodic Refresh (Delta Polling)
    const intervalId = setInterval(async () => {
      const currentMessages = messagesRef.current;
      const lastMessage = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1] : null;

      let query = supabase
        .from('Messages')
        .select('*')
        .eq('inquiry_id', selectedInquiry.id)
        .order('created_at', { ascending: true });

      if (lastMessage) {
        query = query.gt('created_at', lastMessage.created_at);
      }

      const { data } = await query;
      
      if (data && data.length > 0) {
        // Only trigger re-render if new unique messages exist
        setMessages(prev => {
          const newUniqueMessages = data.filter(n => !prev.some(p => p.id === n.id));
          if (newUniqueMessages.length === 0) return prev;
          return [...prev, ...newUniqueMessages];
        });
      }

      // Also refresh visit schedules to catch status updates
      const { data: vsData } = await supabase
        .from('VisitSchedule')
        .select('*')
        .eq('inquiry_id', selectedInquiry.id)
        .order('created_at', { ascending: true });
        
      if (vsData) {
        setVisitSchedules(vsData);
      }
    }, 5000);

    // 3. Fallback Realtime Subscription
    const channel = supabase
      .channel(`chat-${selectedInquiry.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'Messages', 
        filter: `inquiry_id=eq.${selectedInquiry.id}` 
      }, 
      (payload) => {
        if (payload.eventType === 'INSERT') {
          if (payload.new.sender_id !== ownerData?.id) {
            markAsRead(selectedInquiry.id);
          }
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(m => m.id === payload.old.id));
        }
      })
      .subscribe();

    const vsChannel = supabase
      .channel(`chat-vs-${selectedInquiry.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'VisitSchedule',
        filter: `inquiry_id=eq.${selectedInquiry.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          if (payload.new.sender_id !== ownerData?.id) {
            markAsRead(selectedInquiry.id);
          }
          setVisitSchedules(prev => {
            if (prev.some(vs => vs.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'UPDATE') {
          setVisitSchedules(prev => prev.map(vs => vs.id === payload.new.id ? payload.new : vs));
        } else if (payload.eventType === 'DELETE') {
          setVisitSchedules(prev => prev.filter(vs => vs.id === payload.old.id));
        }
      })
      .subscribe();

    return () => { 
      clearInterval(intervalId);
      supabase.removeChannel(channel); 
      supabase.removeChannel(vsChannel);
    };
  }, [selectedInquiry]);

  const combinedItems = useMemo(() => {
    const combined = [
      ...messages,
      ...visitSchedules.map(vs => ({
        id: vs.id,
        inquiry_id: vs.inquiry_id,
        type: 'visit_proposal',
        sender_id: vs.sender_id,
        receiver_id: vs.receiver_id,
        created_at: vs.created_at,
        metadata: {
          date: vs.date,
          time: vs.time,
          status: vs.status
        }
      }))
    ];
    return combined.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages, visitSchedules]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedInquiry || !ownerData) return;
    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic Chat Update
    const optimisticMsg = {
        id: `temp-${Date.now()}`,
        inquiry_id: selectedInquiry.id,
        sender_id: ownerData.id,
        content,
        created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    // Optimistic Sidebar Update
    setInquiries(prev => {
      const updated = prev.map(inq => {
        if (inq.id === selectedInquiry.id) {
          return {
            ...inq,
            latest_message_content: content,
            latest_message_time: optimisticMsg.created_at,
            status: inq.status === 'new' ? 'replied' : inq.status
          };
        }
        return inq;
      });
      return [...updated].sort((a, b) => 
        new Date(b.latest_message_time).getTime() - new Date(a.latest_message_time).getTime()
      );
    });

    try {
      const { data, error } = await supabase.from('Messages').insert([{ 
        inquiry_id: selectedInquiry.id, 
        sender_id: ownerData.id, 
        content 
      }]).select();

      if (error) throw error;
      
      // Replace optimistic message with real one from DB
      if (data && data[0]) {
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data[0] : m));
      }

      if (selectedInquiry.status === 'new') {
        const { error: statusError } = await supabase
          .from('Inquiries')
          .update({ status: 'replied' })
          .eq('id', selectedInquiry.id);
        
        if (!statusError) {
          // Update local inquiry status if not already updated optimistically
          setInquiries(prev => prev.map(inq => 
            inq.id === selectedInquiry.id ? { ...inq, status: 'replied' } : inq
          ));
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Optional: Remove the optimistic message on error
    }
  };

  const handleConfirmVisit = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('VisitSchedule')
        .update({ status: 'accepted' })
        .eq('id', scheduleId);

      if (error) throw error;

      const acceptedMsg = combinedItems.find(m => m.id === scheduleId);

      if (acceptedMsg?.metadata) {
        await supabase
          .from('Inquiries')
          .update({
            visit_date: format(new Date(acceptedMsg.metadata.date), 'yyyy-MM-dd'),
            visit_time: acceptedMsg.metadata.time
          })
          .eq('id', selectedInquiry.id);
      }

      const systemMsg = {
        inquiry_id: selectedInquiry.id,
        sender_id: ownerData.id,
        type: 'system_visit_approved',
        content: `APPROVED VISIT`,
        metadata: { date: acceptedMsg?.metadata?.date, time: acceptedMsg?.metadata?.time },
        created_at: new Date().toISOString()
      };

      const ratingRequestMsg = {
        inquiry_id: selectedInquiry.id,
        sender_id: ownerData.id,
        type: 'system_rating_request',
        content: `RATING REQUEST`,
        metadata: { 
          dorm_id: selectedInquiry.dorm_id, 
          dorm_name: selectedInquiry.dorm_name,
          status: 'pending' 
        },
        created_at: new Date(new Date().getTime() + 1000).toISOString() // Send slightly after the approval
      };

      await supabase.from('Messages').insert([systemMsg, ratingRequestMsg]);

      // Update local inquiries state (sidebar) immediately
      setInquiries(prev => {
        const updated = prev.map(inq => {
          if (inq.id === selectedInquiry.id) {
            return {
              ...inq,
              latest_message_content: systemMsg.content,
              latest_message_time: systemMsg.created_at
            };
          }
          return inq;
        });
        return [...updated].sort((a, b) => 
          new Date(b.latest_message_time).getTime() - new Date(a.latest_message_time).getTime()
        );
      });

      setSuccessModalData({
        title: 'Visit Confirmed!',
        message: `You've successfully scheduled a visit for ${acceptedMsg?.metadata?.date ? format(new Date(acceptedMsg.metadata.date), 'MMMM d') : 'the requested date'} at ${acceptedMsg?.metadata?.time}.`
      });
      setIsSuccessModalOpen(true);

      // Re-fetch messages to get the new system message
      const { data: refreshed } = await supabase
        .from('Messages')
        .select('*')
        .eq('inquiry_id', selectedInquiry.id)
        .order('created_at', { ascending: true });
      if (refreshed) setMessages(refreshed);
    } catch (err) {
      console.error('Error confirming visit:', err);
    }
  };

  const handleCounterProposal = async (date: Date, time: string) => {
    if (!selectedInquiry || !ownerData) return;
    try {
      // 1. Conflict Guard (Accepted visits only)
      const { data: confirmed } = await supabase
        .from('VisitSchedule')
        .select('id, status')
        .eq('inquiry_id', selectedInquiry.id)
        .eq('status', 'accepted')
        .limit(1);

      if (confirmed && confirmed.length > 0) {
        setSuccessModalData({
          title: 'Confirmed Schedule Exists',
          message: 'This user already has a confirmed visit. Please reschedule through the calendar if changes are needed.'
        });
        setIsSuccessModalOpen(true);
        return;
      }

      // 2. Negotiation Logic: If a pending proposal exists, mark it as 'declined' to make room for the new one
      await supabase
        .from('VisitSchedule')
        .update({ status: 'declined' })
        .eq('inquiry_id', selectedInquiry.id)
        .eq('status', 'pending');

      const { error } = await supabase.from('VisitSchedule').insert([{ 
        inquiry_id: selectedInquiry.id, 
        sender_id: ownerData.id,
        receiver_id: selectedInquiry.user_id,
        dorm_id: selectedInquiry.dorm_id,
        date: format(date, 'yyyy-MM-dd'),
        time
      }]);

      if (error) throw error;

      // Re-fetch visit schedules
      const { data: refreshed } = await supabase
        .from('VisitSchedule')
        .select('*')
        .eq('inquiry_id', selectedInquiry.id)
        .order('created_at', { ascending: true });
      if (refreshed) setVisitSchedules(refreshed);
    } catch (err) {
      console.error('Error countering proposal:', err);
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries
      .filter(inq => 
        inq.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        inq.dorm_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [inquiries, searchQuery]);

  return (
    <div className="min-h-screen bg-[url('/backgrounds/tuloyphownerbg.svg')] bg-cover bg-fixed bg-center">
      <div className="max-w-7xl mx-auto h-screen flex flex-col md:flex-row relative">
        
        {/* Sidebar / Inbox Panel */}
        <aside className={`
          ${view === 'chat' ? 'hidden md:flex' : 'flex'}
          flex-col w-full md:w-[380px] lg:w-[420px] bg-transparent z-20 
          animate-in fade-in slide-in-from-left-4 duration-500
        `}>
          {/* Sidebar Header */}
          <div className="p-6 pb-4 bg-transparent">
            <div className="flex justify-between items-end mb-8">
               <div>
                  <h1 className="text-3xl font-black text-neutral-dark mb-1 tracking-tight">Messages</h1>
                  <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.15em] opacity-60">Inquiries & Visit Requests</p>
               </div>
            </div>

            {/* Premium Search Bar */}
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
               <input 
                 type="text"
                 placeholder="Search conversations..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-gray-50/80 border-transparent rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-neutral-dark placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
               />
            </div>

            </div>

        {/* Conversation List */}
        <div className="mt-4 flex-1 overflow-y-auto px-4 pb-32 md:pb-6 scrollbar-hide space-y-3">
          {loading ? (
            <div className="space-y-4">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="h-20 w-full bg-gray-50 animate-pulse rounded-2xl" />
               ))}
            </div>
          ) : (
            filteredInquiries.length > 0 ? (
              filteredInquiries.map((inquiry) => {
                const isSelected = selectedInquiry?.id === inquiry.id;
                const hasUnread = (inquiry.unread_count > 0) || (inquiry.status === 'new');

                return (
                  <button
                    key={inquiry.id}
                    onClick={() => { setSelectedInquiry(inquiry); setView('chat'); }}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 relative border-2 ${
                      isSelected
                        ? 'bg-white border-primary shadow-md translate-x-1'
                        : 'bg-gray-50/50 border-gray-100 hover:border-gray-200 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Circle Profile Section */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 p-0.5 transition-colors ${
                          isSelected ? 'border-primary' : 'border-gray-200'
                        }`}>
                          {inquiry.user_image ? (
                            <div className="relative w-full h-full rounded-full overflow-hidden">
                              <Image
                                src={inquiry.user_image}
                                alt="Profile"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-primary font-black text-lg uppercase">
                              {inquiry.user_name?.[0]}
                            </div>
                          )}
                        </div>
                        
                        {/* Unread Status Dot */}
                        {hasUnread && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary border-2 border-white rounded-full z-10 shadow-sm" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm truncate ${
                            isSelected || hasUnread ? 'font-black text-neutral-dark' : 'font-bold text-gray-500'
                          }`}>
                            {inquiry.user_name}
                          </h4>
                          <span className={`text-[10px] font-bold uppercase tracking-tight ${
                            isSelected ? 'text-primary' : 'text-gray-400'
                          }`}>
                            {formatDistanceToNow(
                              new Date(inquiry.latest_message_time || inquiry.created_at),
                              { addSuffix: false }
                            ).replace('about ', '')}
                          </span>
                        </div>

                        {/* Dorm Name Badge */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            isSelected ? 'bg-primary/10' : 'bg-gray-100'
                          }`}>
                            <Home className={`w-3 h-3 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                            <p className={`text-[9px] font-black uppercase tracking-wider truncate ${
                              isSelected ? 'text-primary' : 'text-gray-500'
                            }`}>
                              {inquiry.dorm_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <p className={`text-xs truncate ${
                            hasUnread ? 'text-neutral-dark font-bold' : 'text-gray-400 font-medium'
                          }`}>
                            {inquiry.latest_message_content || 'No messages yet'}
                          </p>
                          {inquiry.unread_count > 0 && (
                            <span className="bg-secondary text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-sm">
                              {inquiry.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 mb-4">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No conversations found</p>
              </div>
            )
          )}
        </div>
        </aside>

        {/* --- Main Conversation Panel Redesign --- */}
        <main className={`
  ${view === 'chat' ? 'flex' : 'hidden md:flex'}
  flex-1 flex-col bg-transparent overflow-hidden relative
  ${view === 'chat' ? 'animate-in fade-in slide-in-from-right-4 duration-500' : ''}
`}>
  {selectedInquiry ? (
    <>
      {/* Chat Header: Refined and Clean */}
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-transparent sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('inbox')}
            className="md:hidden p-2 -ml-2 text-neutral-dark hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative border border-gray-50">
              {selectedInquiry.user_image ? (
                <Image src={selectedInquiry.user_image} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-gray-400 text-xs">
                  {selectedInquiry.user_name?.[0]}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          
          <div>
            <h3 className="text-sm font-black text-neutral-dark tracking-tight leading-tight">
              {selectedInquiry.user_name}
            </h3>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-80">
              Inquiring about {selectedInquiry.dorm_name}
            </p>
          </div>
        </div>
      </header>

      {/* Messages Content: The "Messenger" Flow */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-transparent scrollbar-hide">
        
        {/* Smart Contextual Header (Minimalist) */}
        <div className="flex flex-col items-center">
          <div className="mt-4 w-full flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-100" />
            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest whitespace-nowrap">
              {format(new Date(selectedInquiry.created_at), 'MMMM d, yyyy')}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-100" />
          </div>
        </div>

      {/* The Initial Inquiry (Rendered as the first User Message) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start mb-6"
        >
          <div className="max-w-[90%] sm:max-w-[80%] flex flex-col items-start">
            <div className="bg-white/5 text-neutral-dark rounded-[1.5rem] rounded-tl-[0.4rem] overflow-hidden border border-white/10 shadow-sm">
              
              {/* Large Property Preview Section */}
              <Link 
                href={`/owner/listings/${selectedInquiry.dorm_id}`}
                className="flex items-center gap-5 p-4 bg-white/5 border-b border-white/10 hover:bg-white/10 transition-all group"
              >
              {/* Hero Image: Now 128px by 80px Rectangle */}
                <div className="w-32 h-20 rounded-xl bg-white overflow-hidden relative flex-shrink-0 shadow-md border border-gray-100">
                  {selectedInquiry.dorm_image ? (
                    <Image 
                      src={selectedInquiry.dorm_image} 
                      alt="" 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <Home className="w-6 h-6 text-gray-200" />
                    </div>
                  )}
                  
                  {/* Inquiry Badge Overlay - Repositioned slightly for the wider frame */}
                  <div className="absolute top-2 left-2">
                      <div className="bg-primary/90 backdrop-blur-sm text-[7px] font-black text-white px-2 py-0.5 rounded-md uppercase tracking-[0.1em] shadow-sm">
                        New Inquiry
                      </div>
                  </div>
                </div>
                <div className="flex flex-col min-w-0 py-1">
                  <h4 className="text-sm font-black text-neutral-dark truncate pr-2 tracking-tight group-hover:text-primary transition-colors mb-1">
                    {selectedInquiry.dorm_name}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest">
                    View Property <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            
            </div>

            <span className="text-[8px] font-black text-gray-300 uppercase mt-2 px-1 tracking-[0.2em]">
              {format(new Date(selectedInquiry.created_at), 'h:mm a')} • Initial Inquiry
            </span>
          </div>
        </motion.div>
{/* Real-time Messages Loop */}
        <AnimatePresence>
          {(() => {
            const latestProposalIndex = combinedItems.findLastIndex 
              ? combinedItems.findLastIndex(m => m.type === 'visit_proposal')
              : (() => {
                  const revIndex = [...combinedItems].reverse().findIndex(m => m.type === 'visit_proposal');
                  return revIndex === -1 ? -1 : (combinedItems.length - 1 - revIndex);
                })();

            const latestApprovedIndex = combinedItems.findLastIndex
              ? combinedItems.findLastIndex(m => m.type === 'system_visit_approved')
              : (() => {
                  const revIndex = [...combinedItems].reverse().findIndex(m => m.type === 'system_visit_approved');
                  return revIndex === -1 ? -1 : (combinedItems.length - 1 - revIndex);
                })();

            return combinedItems.map((msg, idx) => {
              if (msg.type === 'visit_proposal') {
                if (idx !== latestProposalIndex || msg.metadata?.status !== 'pending') return null;
              }

              if (msg.type === 'system_rating_request') return null;
              
              if (msg.type === 'system_visit_approved') {
                if (idx !== latestApprovedIndex) return null;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className="flex flex-col items-center w-full my-8"
                  >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20">
                          <Calendar className="w-3.5 h-3.5" />
                          APPROVED VISIT: {msg.metadata?.date ? format(new Date(msg.metadata.date), 'MMMM d, yyyy') : ''} AT {msg.metadata?.time}
                        </span>
                        <Link 
                          href="/owner/calendar"
                          className="text-[8px] font-black text-secondary uppercase tracking-[0.2em] hover:underline flex items-center gap-1"
                        >
                          View Schedule <ChevronRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                  </motion.div>
                );
              }

              const isMine = msg.sender_id === ownerData.id;
              const isNextFromSame = idx < combinedItems.length - 1 && combinedItems[idx + 1].sender_id === msg.sender_id && combinedItems[idx + 1].type !== 'system_visit_approved';
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${isNextFromSame ? 'mb-1' : 'mb-4'}`}
                >
                  <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`
                      px-4 py-2.5 rounded-[1.2rem] text-[13px] font-medium leading-relaxed
                      ${isMine 
                        ? 'bg-primary text-white rounded-tr-[0.2rem] shadow-sm shadow-primary/10' 
                        : 'bg-white text-neutral-dark rounded-tl-[0.2rem] border border-gray-100 shadow-sm'}
                    `}>
                      {msg.type === 'visit_proposal' ? (
                        <div className="space-y-3 min-w-[200px] py-1">
                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isMine ? 'text-white/60' : 'text-neutral-dark/60'}`}>
                               <Calendar className="w-3.5 h-3.5" /> Visit Proposal
                            </div>
                            <div className={`py-2 border-y ${isMine ? 'border-white/10' : 'border-gray-100'}`}>
                               <p className="text-lg font-black leading-none">{msg.metadata?.date ? format(new Date(msg.metadata.date), 'MMMM d') : ''}</p>
                               <p className="text-[10px] font-bold opacity-80 mt-1">{msg.metadata?.time}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                               {msg.metadata?.status === 'pending' && !isMine ? (
                                 <>
                                   <button onClick={() => handleConfirmVisit(msg.id)} className="w-full bg-secondary text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/5 hover:scale-105 active:scale-95 transition-all">Accept</button>
                                   <button onClick={() => setIsVisitModalOpen(true)} className="w-full bg-gray-50 text-neutral-dark py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200 hover:bg-gray-100 transition-colors">Suggest Change</button>
                                 </>
                               ) : (
                                 <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block text-center ${isMine ? 'bg-white/10' : 'bg-gray-100'}`}>
                                    Status: {msg.metadata?.status || 'Pending'}
                                 </div>
                               )}
                            </div>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    
                    {!isNextFromSame && (
                      <span className="text-[8px] font-bold text-gray-300 uppercase mt-1 px-1">
                        {format(new Date(msg.created_at), 'h:mm a')}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            });
          })()}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-2" />
      </div>
        {/* Modern Messenger Input */}
        <footer className="p-4 bg-white backdrop-blur-md border-t border-gray-100 sticky bottom-0 w-full z-20 mt-auto flex-shrink-0">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 max-w-4xl mx-auto"
          >
            {/* Input Box */}
            <div className="flex-1 bg-gray-50/80 border border-gray-200/50 rounded-[1.5rem] px-4 py-1.5 flex items-end focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/5 transition-all">
              <textarea 
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
                placeholder="Aa"
                className="flex-1 bg-transparent py-2 text-sm font-medium text-neutral-dark placeholder:text-gray-400 outline-none resize-none max-h-32"
              />
            </div>
            
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="mb-1 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden
                enabled:bg-primary enabled:text-white enabled:shadow-lg enabled:shadow-primary/20 enabled:hover:scale-105 enabled:active:scale-95
                disabled:bg-gray-100 disabled:text-gray-300"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
        </footer>
          </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-transparent">
               <div className="relative mb-12">
                  <div className="w-32 h-32 bg-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center text-primary relative z-10 animate-bounce transition-all duration-1000">
                     <MessageSquare className="w-12 h-12" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-secondary/10 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
               </div>
               
               <div className="text-center space-y-4 max-w-sm">
                  <h2 className="text-3xl font-black text-neutral-dark tracking-tighter leading-tight italic">
                    Your Inbox is Waiting...
                  </h2>
                  <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest opacity-60">
                    Select a conversation from the sidebar to view details and reply to prospective residents.
                  </p>
                  
                  <div className="pt-8 flex flex-wrap justify-center gap-3">
                     {['Quick Replies', 'Direct Support', 'Visit Tracking'].map(tag => (
                       <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-gray-400 uppercase tracking-widest">{tag}</span>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </main>

      </div>

      <ScheduleVisitModal 
        isOpen={isVisitModalOpen} 
        onClose={() => setIsVisitModalOpen(false)} 
        dormName={selectedInquiry?.dorm_name}
        role="owner"
        onConfirm={async (date: Date, time: string) => {
          handleCounterProposal(date, time);
        }}
      />

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successModalData.title}
        message={successModalData.message}
      />
    </div>
  );
}
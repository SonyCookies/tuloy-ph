'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ArrowLeft,
  User,
  MoreHorizontal,
  Mail,
  Phone,
  Send,
  ExternalLink,
  ChevronRight,
  Home,
  Clock,
  Sparkles,
  Info,
  Calendar
} from "lucide-react";
import ScheduleVisitModal from "@/app/components/ui/ScheduleVisitModal";
import SuccessModal from "@/app/components/ui/SuccessModal";
import { format } from "date-fns";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from "framer-motion";

import { Suspense } from "react";
import { useNotifications } from '@/app/components/providers/NotificationProvider';

export default function OwnerInquiries() {
  const [filter, setFilter] = useState('all');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const { markAsRead } = useNotifications();
  const [messages, setMessages] = useState<any[]>([]);
  const [visitSchedules, setVisitSchedules] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [ownerData, setOwnerData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [view, setView] = useState<'inbox' | 'chat'>('inbox');
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState({ title: '', message: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<any[]>([]);
  const visitSchedulesRef = useRef<any[]>([]);

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setOwnerData({
          id: user.id,
          name: user.user_metadata?.full_name || 'Owner',
          avatar: user.user_metadata?.avatar_url,
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
            dorm_name: inq.Dorm?.name,
            email: inq.User?.email,
            phone: inq.User?.mobile,
            user_name: inq.User?.name || inq.student_name,
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
    const msgChannel = supabase.channel('owner-inquiry-sidebar-messages')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'Messages'
      }, () => fetchData())
      .subscribe();

    const vsChannel = supabase.channel('owner-inquiry-sidebar-visits')
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

  // Fetch student profile + messages when a thread is selected
  useEffect(() => {
    if (!selectedInquiry) return;
    
    markAsRead(selectedInquiry.id);

    const fetchUserProfile = async () => {
      if (!selectedInquiry.user_id) return;
      const { data } = await supabase
        .from('User')
        .select('name, image')
        .eq('id', selectedInquiry.user_id)
        .single();
      if (data) setUserProfile(data);
    };

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('Messages')
        .select('*')
        .eq('inquiry_id', selectedInquiry.id)
        .order('created_at', { ascending: true });
      if (error) console.error('Error fetching messages:', error);
      else setMessages(data || []);
    };

    const fetchVisitSchedules = async () => {
      const { data, error } = await supabase
        .from('VisitSchedule')
        .select('*')
        .eq('inquiry_id', selectedInquiry.id)
        .order('created_at', { ascending: true });
      if (error) console.error('Error fetching visit schedules:', error);
      else setVisitSchedules(data || []);
    };

    fetchUserProfile();
    fetchMessages();
    fetchVisitSchedules();

    const channel = supabase
      .channel(`owner-inquiry-${selectedInquiry.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'Messages',
        filter: `inquiry_id=eq.${selectedInquiry.id}`
      }, (payload) => {
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
      .channel(`owner-inquiry-vs-${selectedInquiry.id}`)
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
      supabase.removeChannel(channel); 
      supabase.removeChannel(vsChannel);
    };
  }, [selectedInquiry]);

  const combinedItems = React.useMemo(() => {
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

    const toSend = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase
        .from('Messages')
        .insert([{ inquiry_id: selectedInquiry.id, sender_id: ownerData.id, content: toSend }]);

      if (error) throw error;

      // Mark as replied
      if (selectedInquiry.status === 'new') {
        await supabase.from('Inquiries').update({ status: 'replied' }).eq('id', selectedInquiry.id);
      }

      // Re-fetch messages to ensure the list is current
      const { data: refreshed } = await supabase
        .from('Messages')
        .select('*')
        .eq('inquiry_id', selectedInquiry.id)
        .order('created_at', { ascending: true });
      if (refreshed) setMessages(refreshed);

    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleAcceptProposal = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('VisitSchedule')
        .update({ status: 'accepted' })
        .eq('id', scheduleId);

      if (error) throw error;
      
      const acceptedMsg = combinedItems.find(m => m.id === scheduleId);

      // Notify via text after accepting
      const systemMsg = {
        inquiry_id: selectedInquiry.id,
        sender_id: ownerData.id,
        type: 'system_visit_approved',
        content: `APPROVED VISIT`,
        metadata: { date: acceptedMsg?.metadata?.date, time: acceptedMsg?.metadata?.time },
        created_at: new Date().toISOString()
      };

      await supabase.from('Messages').insert([systemMsg]);

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

      // Re-fetch messages
      const { data: refreshed } = await supabase
        .from('Messages')
        .select('*')
        .eq('inquiry_id', selectedInquiry.id)
        .order('created_at', { ascending: true });
      if (refreshed) setMessages(refreshed);
    } catch (err) {
      console.error('Error accepting proposal:', err);
    }
  };

  const handleCounterProposal = async (date: Date, time: string) => {
    if (!selectedInquiry || !ownerData) return;

    try {
      const { error } = await supabase
        .from('VisitSchedule')
        .insert([{ 
          inquiry_id: selectedInquiry.id, 
          sender_id: ownerData.id,
          receiver_id: selectedInquiry.user_id,
          dorm_id: selectedInquiry.dorm_id,
          date: format(date, 'yyyy-MM-dd'),
          time
        }]);

      if (error) throw error;

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

  const handleSelectThread = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setView('chat');
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    if (filter === 'all') return true;
    return inquiry.status === filter;
  });

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-10">
      <AnimatePresence mode="wait">
        {view === 'inbox' ? (
          <motion.div 
            key="inbox"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="animate-in fade-in duration-700"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2">
              <div>
                <div className="flex items-center gap-3 text-primary mb-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Communication Hub</span>
                </div>
                <h1 className="text-4xl font-black text-neutral-dark tracking-tight">Student Inquiries</h1>
                <p className="text-gray-400 font-medium mt-2">Engage with potential residents and answer their questions.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.04)] border border-gray-100 mb-10 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search student or dorm name..."
                  className="w-full pl-12 pr-6 py-4 bg-gray-50/50 rounded-2xl outline-none focus:bg-white border border-transparent focus:border-primary/20 transition-all font-bold text-neutral-dark text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                {['All', 'New', 'Replied'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f.toLowerCase())}
                    className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                      filter === f.toLowerCase() 
                        ? 'bg-neutral-dark text-white shadow-lg shadow-black/10' 
                        : 'text-gray-400 hover:text-neutral-dark hover:bg-gray-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Loading Inquiries...</p>
                </div>
              ) : filteredInquiries.length > 0 ? (
                filteredInquiries.map((inquiry) => (
                  <div 
                    key={inquiry.id} 
                    onClick={() => handleSelectThread(inquiry)}
                    className="group bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Student Profile Card */}
                      <div className="w-full md:w-64 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                            {inquiry.user_name?.[0] || 'U'}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-neutral-dark">{inquiry.user_name}</h3>
                            <div className="flex items-center gap-1.5 text-secondary text-[10px] font-black uppercase tracking-tighter">
                              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                              Prospective Tenant
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center gap-3 text-gray-400 group-hover:text-neutral-dark transition-colors">
                            <Mail className="w-4 h-4" />
                            <span className="text-xs font-bold">{inquiry.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-400 group-hover:text-neutral-dark transition-colors">
                            <Phone className="w-4 h-4" />
                            <span className="text-xs font-bold">{inquiry.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Inquiry Message Wrapper */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/5 rounded-full uppercase tracking-tighter">{inquiry.dorm_name}</span>
                              <span className="text-[10px] font-bold text-gray-300">• {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {inquiry.unread_count > 0 && (
                                <div className="bg-red-500 text-white text-[10px] font-black h-6 min-w-[24px] px-2 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-in zoom-in">
                                  {inquiry.unread_count} New
                                </div>
                              )}
                              {inquiry.status === 'new' && (
                                <div className="px-3 py-1 bg-secondary text-white text-[9px] font-black uppercase rounded-full shadow-lg shadow-secondary/20 animate-pulse">New Inquiry</div>
                              )}
                            </div>
                          </div>
                          <p className={`font-bold leading-relaxed text-lg mb-6 line-clamp-2 ${inquiry.unread_count > 0 ? 'text-neutral-dark underline decoration-primary/30' : 'text-neutral-dark opacity-70 font-medium'}`}>
                            "{inquiry.latest_message_content}"
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
                          <div className="flex items-center gap-4">
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Click to view conversation</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <button className="px-8 py-4 bg-neutral-dark text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                              Open Chat
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-20 rounded-[3rem] text-center border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-neutral-dark">No inquiries yet</h3>
                  <p className="text-gray-400 font-medium">Messages from students will appear here.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Owner Chat Header */}
            <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setView('inbox')}
                  className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-neutral-dark hover:bg-neutral-dark hover:text-white transition-all shadow-sm"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 flex-shrink-0">
                    {userProfile?.image ? (
                      <img src={userProfile.image} alt={selectedInquiry.user_name} className="w-full h-full object-cover" />
                    ) : (
                      selectedInquiry.user_name?.[0]
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-neutral-dark leading-tight">{selectedInquiry.user_name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-secondary uppercase tracking-[0.1em]">{selectedInquiry.dorm_name}</span>
                       <span className="w-1 h-1 rounded-full bg-gray-300" />
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prospective Tenant</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex gap-3">
                 <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:bg-gray-100 transition-all">
                    <Info className="w-4 h-4" /> Details
                 </button>
              </div>
            </div>

            {/* Owner Chat Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-[#FDFDFD]">
              {/* Initial Context Bubble */}
              <div className="flex flex-col items-center mb-10 px-6 py-10 bg-gray-50/50 rounded-[3rem] border border-gray-100 text-center max-w-2xl mx-auto">
                 <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-primary mb-5 rotate-3">
                    <Sparkles className="w-7 h-7" />
                 </div>
                 <p className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Student's Initial Question</p>
                 <p className="text-lg font-bold text-neutral-dark leading-relaxed italic opacity-80 px-8">
                    "{selectedInquiry.message}"
                 </p>
                 <div className="mt-8 flex items-center gap-4">
                    <a 
                      href={selectedInquiry.dorm_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-neutral-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Your Property
                    </a>
                 </div>
              </div>

            {(() => {
                const latestProposalIndex = combinedItems.findLastIndex 
                  ? combinedItems.findLastIndex(m => m.type === 'visit_proposal')
                  : (() => {
                      const revIndex = [...combinedItems].reverse().findIndex(m => m.type === 'visit_proposal');
                      return revIndex === -1 ? -1 : (combinedItems.length - 1 - revIndex);
                    })();

                return combinedItems.map((msg, i) => {
                  // Hide proposals that are not the latest OR not pending
                  if (msg.type === 'visit_proposal') {
                    if (i !== latestProposalIndex || msg.metadata?.status !== 'pending') return null;
                  }
                  
                  if (msg.type === 'system_visit_approved') {
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        className="flex flex-col items-center w-full my-8"
                      >
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-[11px] font-black text-primary uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5 bg-primary/5 px-4 py-2 rounded-full border border-primary/20 shadow-sm">
                              <Calendar className="w-4 h-4" />
                              APPROVED VISIT: {msg.metadata?.date ? format(new Date(msg.metadata.date), 'MMMM d, yyyy') : ''} AT {msg.metadata?.time}
                            </span>
                            <a 
                              href="/owner/calendar"
                              className="text-[9px] font-black text-secondary uppercase tracking-[0.2em] hover:underline flex items-center gap-1"
                            >
                              View Schedule <ChevronRight className="w-3 h-3" />
                            </a>
                          </div>
                      </motion.div>
                    );
                  }

                  const isMine = msg.sender_id === ownerData.id;
                  return (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      key={msg.id} 
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] px-6 py-4 rounded-[2.2rem] text-[15px] font-medium shadow-sm transition-all
                        ${isMine 
                          ? 'bg-secondary text-white rounded-tr-none shadow-secondary/10' 
                          : 'bg-white text-neutral-dark border border-gray-100 rounded-tl-none shadow-gray-200/50'}`}
                      >
                        {msg.type === 'visit_proposal' ? (
                          <div className="space-y-3 min-w-[200px]">
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                                <Calendar className="w-3.5 h-3.5" /> Visit Proposal
                             </div>
                             <div className="py-2 border-y border-white/10">
                                <p className="text-lg font-black leading-none">{format(new Date(msg.metadata?.date), 'MMMM d')}</p>
                                <p className="text-[10px] font-bold opacity-80 mt-1">{msg.metadata?.time}</p>
                             </div>
                             <div className="flex flex-col gap-2">
                                {msg.metadata?.status === 'pending' && !isMine ? (
                                  <>
                                    <button onClick={() => handleAcceptProposal(msg.id)} className="w-full bg-secondary text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/5">Accept</button>
                                    <button onClick={() => setIsVisitModalOpen(true)} className="w-full bg-white/10 text-neutral-dark py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200">Suggest Change</button>
                                  </>
                                ) : (
                                  <div className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-full inline-block">
                                     Status: {msg.metadata?.status || 'Pending'}
                                  </div>
                                )}
                             </div>
                          </div>
                        ) : (
                           msg.content
                        )}

                        <p className={`text-[9px] font-bold mt-2 uppercase tracking-tighter opacity-50 ${isMine ? 'text-right' : 'text-left'}`}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </motion.div>
                  );
                });
            })()}
              <div ref={messagesEndRef} />
            </div>

            {/* Owner Message Input Area */}
            <div className="p-8 bg-white border-t border-gray-100">
              {/* Quick Actions Bar */}
              <div className="flex gap-2 mb-4 max-w-4xl mx-auto">
                 <button 
                   onClick={() => setIsVisitModalOpen(true)}
                   className="flex items-center gap-2 px-5 py-2.5 bg-secondary/5 text-secondary rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-secondary hover:text-white transition-all border border-secondary/10 shadow-sm"
                 >
                    <Calendar className="w-3.5 h-3.5" /> Suggest Visit
                 </button>
                 <button 
                   className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border border-gray-100"
                 >
                    <Sparkles className="w-3.5 h-3.5" /> AI Suggest
                 </button>
              </div>

              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-4 max-w-4xl mx-auto bg-gray-50 p-2 pl-6 rounded-[2.5rem] border border-gray-100 group focus-within:bg-white focus-within:border-secondary/20 transition-all shadow-sm"
              >
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a reply to the student..."
                  className="flex-1 bg-transparent py-4 outline-none text-[15px] font-medium text-neutral-dark placeholder:text-gray-300"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-14 h-14 rounded-full bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/30 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  <Send className="w-6 h-6" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modals 
        isVisitModalOpen={isVisitModalOpen}
        setIsVisitModalOpen={setIsVisitModalOpen}
        selectedInquiry={selectedInquiry}
        handleCounterProposal={handleCounterProposal}
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

// Final modals
function Modals({ 
  isVisitModalOpen, 
  setIsVisitModalOpen, 
  selectedInquiry, 
  handleCounterProposal 
}: any) {
  return (
    <>
      {selectedInquiry && (
        <ScheduleVisitModal 
          isOpen={isVisitModalOpen} 
          onClose={() => setIsVisitModalOpen(false)} 
          dormName={selectedInquiry.dorm_name}
          dormId={selectedInquiry.dorm_id}
          role="owner"
          onConfirm={handleCounterProposal}
        />
      )}
    </>
  );
}

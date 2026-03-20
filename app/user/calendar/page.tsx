'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  MessageCircle,
  Building2
} from "lucide-react";
import Image from "next/image";
import { supabase } from '@/lib/supabase';
import CalendarSkeleton from '@/app/components/ui/CalendarSkeleton';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO
} from 'date-fns';
import Link from 'next/link';

export default function UserCalendar() {
  const [isLoading, setIsLoading] = useState(true);
  const [visits, setVisits] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('VisitSchedule')
          .select('*, Dorm(name, images)')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted')
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (error) throw error;
        
        // Deduplicate: If for some reason multiple visits exist for the same inquiry, keep only the latest one
        const uniqueVisits = (data || []).reduce((acc: any[], current: any) => {
          const existing = acc.find(v => v.inquiry_id === current.inquiry_id);
          if (!existing) {
            acc.push(current);
          } else {
            // Compare created_at to keep the latest
            if (new Date(current.created_at) > new Date(existing.created_at)) {
              const index = acc.indexOf(existing);
              acc[index] = current;
            }
          }
          return acc;
        }, []);

        const transformed = uniqueVisits.map(vs => ({
          ...vs,
          visit_date: vs.date,
          visit_time: vs.time,
        }));

        setVisits(transformed);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisits();
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDayOfWeek = monthStart.getDay(); // 0 = Sunday
  const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => i);

  // Get visits for the currently viewed month
  const getVisitsForDate = (date: Date) => {
    return visits.filter(visit => isSameDay(parseISO(visit.visit_date), date));
  };

  const selectedDateVisits = getVisitsForDate(selectedDate);

  if (isLoading) return <CalendarSkeleton />;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-32 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-dark mb-2 tracking-tight">My Visits</h1>
        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest opacity-60">
          View your approved property tours
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Calendar Grid Section */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100">
          
          {/* Calendar Controls */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-neutral-dark capitalize tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {paddingDays.map(pad => (
              <div key={`pad-${pad}`} className="aspect-square rounded-2xl bg-transparent" />
            ))}
            
            {daysInMonth.map(day => {
              const dayVisits = getVisitsForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const hasVisits = dayVisits.length > 0;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-bold transition-all
                    ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'hover:bg-gray-50 text-neutral-dark'}
                    ${isTodayDate && !isSelected ? 'text-primary ring-2 ring-primary/20 bg-primary/5' : ''}
                  `}
                >
                  {format(day, 'd')}
                  
                  {hasVisits && (
                    <div className="absolute bottom-2 flex gap-1">
                      {dayVisits.slice(0, 3).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-secondary'}`} 
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details Panel */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-neutral-dark to-gray-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-1">
              {isToday(selectedDate) ? 'Today' : 'Selected Date'}
            </h3>
            <p className="text-2xl font-bold tracking-tight mb-2">
              {format(selectedDate, 'EEEE')}
            </p>
            <p className="text-sm font-medium text-gray-400">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>

          <div className="flex-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">
              {selectedDateVisits.length} {selectedDateVisits.length === 1 ? 'Visit' : 'Visits'} Scheduled
            </h4>

            {selectedDateVisits.length > 0 ? (
              <div className="space-y-4">
                {selectedDateVisits.map((visit) => (
                  <div key={visit.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-secondary" />
                        <span className="text-xs font-black text-neutral-dark tracking-tight">
                          {visit.visit_time}
                        </span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
                        Approved
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      {visit.Dorm?.images?.[0] ? (
                         <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                           <Image src={visit.Dorm.images[0]} alt="Property" fill className="object-cover" />
                         </div>
                      ) : (
                         <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                           <Building2 className="w-5 h-5 text-gray-300" />
                         </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-dark line-clamp-1">
                          {visit.Dorm?.name || visit.dorm_name}
                        </div>
                        <Link 
                          href={`/user/messages?id=${visit.inquiry_id}`}
                          className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-primary uppercase tracking-widest mt-1 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" /> Chat with owner
                        </Link>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        href={`/user/dorms/${visit.dorm_id}`}
                        className="flex-1 bg-gray-50 hover:bg-gray-100 text-neutral-dark py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-1.5 border border-gray-200"
                      >
                         <Home className="w-3.5 h-3.5" /> View
                      </Link>
                      <Link 
                        href={`/user/messages?id=${visit.inquiry_id}`}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex justify-center items-center gap-1.5"
                      >
                         <MessageCircle className="w-3.5 h-3.5" /> Message
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center">
                <CalendarIcon className="w-8 h-8 text-gray-300 mb-3" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  No visits scheduled<br/>for this date
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

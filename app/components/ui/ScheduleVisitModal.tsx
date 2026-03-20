'use client';

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  Home
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isBefore,
  startOfToday,
  parse
} from "date-fns";

interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  dormName: string;
  dormId?: string | number;
  onConfirm?: (date: Date, time: string) => Promise<void>;
  role?: 'user' | 'owner';
}

export default function ScheduleVisitModal({ isOpen, onClose, dormName, dormId, onConfirm, role = 'user' }: ScheduleVisitModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const filteredTimeSlots = useMemo(() => {
    const rawSlots = [
      { label: "Morning", times: ["09:00 AM", "10:00 AM", "11:00 AM"] },
      { label: "Afternoon", times: ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"] },
    ];
    if (!selectedDate) return [];
    const isToday = isSameDay(selectedDate, new Date());
    const now = new Date();

    return rawSlots.map(group => ({
      ...group,
      times: group.times.filter(timeStr => {
        if (!isToday) return true;
        const timeDate = parse(timeStr, 'hh:mm a', new Date());
        return isBefore(now, timeDate);
      })
    })).filter(group => group.times.length > 0);
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime) {
      const isValid = filteredTimeSlots.some(group => group.times.includes(selectedTime));
      if (!isValid) setSelectedTime("");
    }
  }, [selectedDate, filteredTimeSlots, selectedTime]);

  const handleConfirm = async () => {
    if (selectedDate && selectedTime) {
      setLoading(true);
      try {
        if (onConfirm) {
          await onConfirm(selectedDate, selectedTime);
        } else if (dormId) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: inquiry } = await supabase
              .from('Inquiries')
              .select('id')
              .eq('user_id', user.id)
              .eq('dorm_id', dormId)
              .order('created_at', { ascending: false }).limit(1).single();

            if (inquiry) {
              await supabase.from('Inquiries').update({
                visit_date: format(selectedDate, 'yyyy-MM-dd'),
                visit_time: selectedTime
              }).eq('id', inquiry.id);
            }
          }
        }
        setStep(2);
      } catch (err) {
        console.error('Error saving visit:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedTime("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={handleClose} 
          className="absolute inset-0 bg-neutral-dark/40 backdrop-blur-md" 
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ y: "100%" }} 
          animate={{ y: 0 }} 
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#FAFAFA] rounded-t-2xl sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        >
          {/* Header Section */}
          <div className="p-6 sm:p-8 pb-4 flex-shrink-0">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">

                <h2 className="text-2xl sm:text-3xl font-black text-neutral-dark tracking-tight leading-none">Schedule Visit</h2>
              </div>
              <button onClick={handleClose} className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Property</p>
                <p className="text-sm font-black text-neutral-dark truncate">{dormName}</p>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="px-6 sm:px-8 pb-8 overflow-y-auto scrollbar-hide">
            {step === 1 ? (
              <div className="space-y-6">
                {/* Date Selection Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-100/50">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-2xl bg-gray-50 flex items-center justify-center text-primary">
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-neutral-dark uppercase tracking-widest">{format(currentMonth, "MMMM yyyy")}</h4>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-2xl transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-50 rounded-2xl transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 mb-4">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                      <div key={day} className="text-center text-[10px] font-black text-gray-300 uppercase">{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {eachDayOfInterval({ start: startOfWeek(startOfMonth(currentMonth)), end: endOfWeek(endOfMonth(currentMonth)) }).map((d, i) => {
                      const isSelected = selectedDate && isSameDay(d, selectedDate);
                      const isCurrentMonth = isSameMonth(d, currentMonth);
                      const isPast = isBefore(d, startOfToday());
                      return (
                        <button
                          key={i} 
                          disabled={isPast} 
                          onClick={() => setSelectedDate(d)}
                          className={`h-9 sm:h-10 rounded-2xl text-xs font-bold transition-all flex items-center justify-center
                            ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 font-black' : 
                              isCurrentMonth && !isPast ? 'text-neutral-dark hover:bg-primary/5 hover:text-primary' : 'text-gray-200 pointer-events-none'}`}
                        >
                          {format(d, "d")}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-100/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-dark">Available Slots</h4>
                      <p className="text-[10px] font-medium text-gray-400">Times capped at 4:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {filteredTimeSlots.length > 0 ? filteredTimeSlots.map((group) => (
                      <div key={group.label} className="space-y-3">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">{group.label}</p>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          {group.times.map((time) => (
                            <button
                              key={time} 
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 border-2
                                ${selectedTime === time 
                                  ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-[1.02]' 
                                  : 'bg-gray-50 border-gray-50 text-neutral-dark hover:border-gray-200 hover:bg-white'
                                }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <div className="py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                        <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm font-bold text-gray-400">No slots available for this date</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fixed-at-bottom feel on mobile */}
                <div className="pt-2">
                  <button 
                    disabled={!selectedDate || !selectedTime || loading}
                    onClick={handleConfirm}
                    className="w-full bg-primary hover:bg-neutral-dark text-white py-4 sm:py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                      <>Confirm Selection <ChevronRight className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 sm:py-12 flex flex-col items-center text-center space-y-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2.5rem] bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl sm:text-3xl font-black text-neutral-dark tracking-tight">
                    {role === 'owner' ? 'Proposal Sent' : 'Request Sent'}
                  </h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed px-4">
                    {role === 'owner' 
                      ? 'The student will review your proposal\nand respond in the chat shortly.' 
                      : 'The owner will review your request\nand respond in the chat shortly.'}
                  </p>
                </div>
                <div className="w-full bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Schedule</span>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                      {role === 'owner' ? 'Proposed' : 'Requested'}
                    </span>
                  </div>
                  <div className="h-px bg-gray-50 w-full" />
                  <p className="text-base sm:text-lg font-black text-neutral-dark">{selectedDate && format(selectedDate, "EEEE, MMM d")}</p>
                  <p className="text-xs font-black text-secondary uppercase tracking-[0.2em]">{selectedTime}</p>
                </div>
                <button onClick={handleClose} className="w-full bg-neutral-dark text-white py-4 sm:py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl">Back to Chat</button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
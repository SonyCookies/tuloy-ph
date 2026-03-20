'use client';

import {
  Plus,
  MessageSquare,
  List,
  Moon,
  Sun,
  Heart,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Home
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format, isToday, parseISO } from "date-fns";

export default function OwnerDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic Stats
  const [stats, setStats] = useState({
    activeListings: 0,
    unreadInquiries: 0,
    totalEngagement: 0,
    upcomingTours: 0
  });

  // Dynamic Lists
  const [upcomingVisits, setUpcomingVisits] = useState<any[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from('User')
          .select('*')
          .eq('id', user.id)
          .single();

        const meta = user.user_metadata || {};
        setUserData({
          id: user.id,
          name: profile?.name || meta.name || meta.full_name || 'Owner',
          avatar: profile?.image || meta.avatar_url || meta.picture || meta.image,
          city: profile?.address_city || 'CALAPAN',
          province: profile?.address_province || 'ORIENTAL MINDORO'
        });

        // 2. Fetch Listings Stats
        const { data: listings } = await supabase
          .from('Dorm')
          .select('id, availability')
          .eq('owner_id', user.id);
        
        const activeCount = listings?.filter(l => l.availability === 'available').length || 0;

        // 3. Fetch Inquiries Stats
        const { data: inquiries } = await supabase
          .from('Inquiries')
          .select('*, Messages(is_read, sender_id), VisitSchedule(is_read, receiver_id, status)')
          .eq('owner_id', user.id);

        const totalInq = inquiries?.length || 0;
        const unreadInq = (inquiries || []).filter(inq => {
          const unreadMsgs = (inq.Messages || []).filter((m: any) => !m.is_read && m.sender_id !== user.id).length;
          const unreadVisits = (inq.VisitSchedule || []).filter((vs: any) => !vs.is_read && vs.receiver_id === user.id).length;
          return unreadMsgs > 0 || unreadVisits > 0 || inq.status === 'new';
        }).length;

        // 4. Fetch Upcoming Visits (Accepted)
        const { data: visits } = await supabase
          .from('VisitSchedule')
          .select('*, Dorm(name, images), Inquiries(student_name, user_id)')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted')
          .gte('date', format(new Date(), 'yyyy-MM-dd'))
          .order('date', { ascending: true })
          .order('time', { ascending: true });
        
        setUpcomingVisits((visits || []).slice(0, 3));

        setStats({
          activeListings: activeCount,
          unreadInquiries: unreadInq,
          totalEngagement: totalInq,
          upcomingTours: (visits || []).length
        });

        // 5. Fetch Recent Inquiries
        const { data: recentInq } = await supabase
          .from('Inquiries')
          .select('*, User!user_id(image), Dorm(name, images)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        setRecentInquiries(recentInq || []);

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const firstLetter = userData?.name?.charAt(0)?.toUpperCase() || "?";
  const isNight = currentTime.getHours() >= 18 || currentTime.getHours() < 6;

  // Skeletons
  const SkeletonStats = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8 shimmer">
      <div className="h-40 bg-neutral-dark/10" />
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="p-8 space-y-3">
          <div className="w-20 h-2 bg-gray-200 rounded" />
          <div className="w-32 h-6 bg-gray-300 rounded" />
        </div>
        <div className="p-8 space-y-3">
          <div className="w-20 h-2 bg-gray-200 rounded" />
          <div className="w-32 h-6 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );

  const SkeletonList = () => (
    <div className="space-y-3 mb-10 shimmer">
      {[1, 2].map(i => (
        <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
      ))}
    </div>
  );

  return (
    <div className={`max-w-2xl mx-auto px-4 pt-8 pb-32 transition-opacity duration-500 animate-in fade-in slide-in-from-bottom-5 duration-700`}>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
            <div className="flex items-center gap-2 mb-2 bg-white/50 backdrop-blur-sm w-fit px-3 py-1 rounded-full border border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(currentTime, 'EEEE')}</span>
              <span className="text-[10px] font-bold text-gray-200">/</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{format(currentTime, 'h:mm a')}</span>
            </div>

          <h1 className="text-3xl font-black text-neutral-dark mb-1 tracking-tight">
            {isLoading ? "Hey, ..." : `Hey, ${userData?.name?.split(' ')[0]}!`}
          </h1>
        </div>

        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-xl">
          {!imageLoaded && (
            <span className="absolute inset-0 flex items-center justify-center text-primary font-bold text-xl">
              {firstLetter}
            </span>
          )}
          {userData?.avatar && !imageError && (
            <Image
              src={userData.avatar}
              alt="avatar"
              fill
              className={`object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoadingComplete={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
        </div>
      </div>

      {isLoading ? (
        <>
          <SkeletonStats />
          <div className="h-6 w-32 bg-gray-200 rounded mb-5" />
          <SkeletonList />
          <div className="h-6 w-32 bg-gray-200 rounded mb-5" />
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl shimmer" />)}
          </div>
        </>
      ) : (
        <>
          {/* MAIN STATS CARD */}
          <div className="bg-white rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden mb-8 group transition-all duration-700 hover:shadow-[0_50px_120px_-30px_rgba(0,0,0,0.15)] hover:-translate-y-1">
            <div className="p-8 bg-neutral-dark text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 animate-pulse" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 blur-[80px] -ml-16 -mb-16" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                    Total Student Interest
                  </p>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">{stats.totalEngagement}</span>
                  <span className="text-sm font-bold uppercase tracking-widest text-primary/80">Engagements</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-100 bg-white">
              <div className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 block mb-2">
                  Active Listings
                </span>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-2xl">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-neutral-dark block">{stats.activeListings.toString().padStart(2, '0')}</span>
                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Properties</span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 hover:bg-gray-50/50 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 block mb-2">
                  Upcoming Visits
                </span>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-2xl ${stats.upcomingTours > 0 ? 'bg-secondary/10 text-secondary' : 'bg-gray-50 text-gray-400'}`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-xl font-bold block ${stats.upcomingTours > 0 ? 'text-secondary' : 'text-neutral-dark'}`}>{stats.upcomingTours.toString().padStart(2, '0')}</span>
                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Scheduled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* UPCOMING VISITS SECTION */}
          {upcomingVisits.length > 0 && (
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between mb-5 px-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-neutral-dark tracking-tight uppercase tracking-widest text-sm">Upcoming Visits</h2>
                  </div>
                  <Link href="/owner/calendar" className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-1 hover:gap-2 transition-all">
                    Full Calendar <ArrowRight className="w-3 h-3" />
                  </Link>
              </div>
              
              <div className="space-y-3">
                  {upcomingVisits.map((visit) => (
                    <Link key={visit.id} href={`/owner/calendar?date=${visit.date}`} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] flex items-center justify-between group hover:border-primary/20 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center gap-4">
                          {visit.Dorm?.images?.[0] ? (
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                              <Image src={visit.Dorm.images[0]} alt="Prop" fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100">
                              <Building2 className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm font-bold text-neutral-dark leading-tight mb-1">{visit.Inquiries?.student_name || 'Guest User'}</h3>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                  <Home className="w-3 h-3" /> {visit.Dorm?.name}
                                </span>
                                <span className="text-[10px] font-semibold text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" /> {isToday(parseISO(visit.date)) ? 'Today' : format(parseISO(visit.date), 'MMM d')} • {visit.time}
                                </span>
                            </div>
                          </div>
                      </div>
                      <div className="bg-gray-50 group-hover:bg-primary group-hover:text-white p-3 rounded-2xl text-gray-400 transition-all active:scale-90">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* QUICK ACTIONS GRID */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-neutral-dark tracking-tight uppercase tracking-widest text-sm">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { label: "New Listing", sub: "Add property", icon: <Plus className="w-5 h-5"/>, href: "/owner/add", color: "text-primary", bg: "bg-primary/10" },
                { label: "Listings", sub: "Manage all", icon: <List className="w-5 h-5"/>, href: "/owner/listings", color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Calendar", sub: "View tours", icon: <Calendar className="w-5 h-5"/>, href: "/owner/calendar", color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Master Rules", sub: "Policy sync", icon: <Heart className="w-5 h-5"/>, href: "/owner/rules", color: "text-rose-600", bg: "bg-rose-50" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] relative group hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-10 transition-opacity">
                    {item.icon}
                  </div>
                  
                  <div className={`w-10 h-10 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm border border-black/5`}>
                    {item.icon}
                  </div>
                  
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-dark block mb-0.5">
                      {item.label}
                    </span>
                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.1em] opacity-80">
                      {item.sub}
                    </span>
                  </div>

                  <Link href={item.href} className="absolute inset-0 z-10" />
                </div>
              ))}
            </div>
          </div>

          {/* RECENT INQUIRIES */}
          {recentInquiries.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <h2 className="text-lg font-bold text-neutral-dark tracking-tight uppercase tracking-widest text-sm mb-5">Recent Inquiries</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {recentInquiries.map((inq, idx) => (
                    <Link 
                      key={inq.id} 
                      href={`/owner/messages?id=${inq.id}`}
                      className={`flex items-center justify-between p-6 hover:bg-gray-50 transition-all ${idx !== recentInquiries.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center text-xs font-bold text-neutral-dark shadow-sm overflow-hidden relative border border-gray-100">
                              {inq.User?.image ? (
                                <Image src={inq.User.image} alt="User" fill className="object-cover" />
                              ) : (
                                <span>{inq.student_name?.[0] || 'U'}</span>
                              )}
                          </div>
                          <div>
                              <div className="text-xs font-bold text-neutral-dark uppercase tracking-widest mb-1">{inq.student_name}</div>
                              <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 line-clamp-1">
                                <Building2 className="w-3 h-3" /> {inq.Dorm?.name}
                              </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {inq.status === 'new' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary/40" />
                          )}
                          <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">
                              {format(parseISO(inq.created_at), 'MMM d')}
                          </span>
                        </div>
                    </Link>
                  ))}
                </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
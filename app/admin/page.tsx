'use client';

import { 
  Users, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ShieldCheck,
  TrendingUp,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <div className="relative w-32 h-10">
            <Image
              src="/logo/tuloyphlogolandscape.svg"
              alt="Tuloy PH Logo"
              fill
              className="object-contain brightness-0 invert"
            />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 ml-1">Admin Central</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: 'Overview', icon: TrendingUp, active: true },
            { label: 'Verify Listings', icon: CheckCircle2, count: 5 },
            { label: 'Manage Users', icon: Users },
            { label: 'Dormitories', icon: Building2 },
            { label: 'Flags & Reports', icon: AlertCircle, count: 2 },
            { label: 'System Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                item.active 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 font-medium">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
              {item.count && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/auth/login" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors font-medium">
            <LogOut className="w-5 h-5" />
            Logout Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users, listings, or IDs..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-none">Admin User</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Superuser</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 overflow-hidden">
                <ShieldCheck className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold text-slate-900">System Overview</h1>
            <div className="flex gap-2 text-xs font-bold text-slate-500">
              <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg">Last 24 Hours</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Students', value: '1,284', grow: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'New Listings', value: '15', grow: '+4%', icon: Building2, color: 'text-primary', bg: 'bg-primary/5' },
              { label: 'Pending Verification', value: '5', grow: '-2%', icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Critical Errors', value: '0', grow: 'Healthy', icon: AlertCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${stat.grow.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {stat.grow}
                  </span>
                </div>
                <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Verification Table Placeholder */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Listing Submissions</h2>
              <button className="text-sm font-bold text-primary hover:underline transition-all">View all</button>
            </div>
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <CheckCircle2 className="w-8 h-8 text-slate-300" />
              </div>
              <h4 className="text-slate-900 font-bold">All caught up!</h4>
              <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">No new dorm listings require verification at this moment.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

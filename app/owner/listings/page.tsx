'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  MapPin,
  Users,
  Eye,
  Trash2,
  Edit3,
  Home,
  Star,
  ChevronRight,
  ShieldCheck,
  Building2,
  ArrowRight,
  Info
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from '@/lib/supabase';
import ConfirmModal from '@/app/components/ui/ConfirmModal';

export default function MyListings() {
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: '',
    name: ''
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('Dorm')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  const toggleAvailability = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'not available' : 'available';
    setListings(prev => prev.map(d => d.id === id ? { ...d, availability: newStatus } : d));

    try {
      await supabase.from('Dorm').update({ availability: newStatus }).eq('id', id);
    } catch {
      console.error('Update failed');
    }
  };

  const processDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setIsLoading(true);

    try {
      await supabase.from('Dorm').delete().eq('id', id);
      setListings(prev => prev.filter(d => d.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shimmer">
      <div className="h-44 bg-gray-50 relative">
        <div className="absolute top-4 left-4 w-20 h-5 bg-gray-100 rounded-lg"></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="w-24 h-2 bg-gray-100 rounded" />
          <div className="w-48 h-5 bg-gray-200 rounded" />
          <div className="w-40 h-3 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-10 bg-gray-50 rounded-xl" />
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-11 bg-gray-100 rounded-xl" />
          <div className="flex-1 h-11 bg-gray-100 rounded-xl" />
          <div className="w-11 h-11 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-32 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-neutral-dark mb-1 tracking-tight">My Listings</h1>
          <p className="text-gray-500 font-semibold text-[10px] uppercase tracking-[0.15em] opacity-60">
            Manage and monitor your properties
          </p>
        </div>

        <Link
          href="/owner/add"
          className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all group"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.04)]">
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-lg font-bold text-neutral-dark mb-2 tracking-tight">No Listings Found</h3>
          <p className="text-xs font-semibold text-gray-400 mb-8 uppercase tracking-widest leading-loose">
            Start reaching students by<br/>adding your first property
          </p>
          <Link
            href="/owner/add"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            Create Listing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {listings.map((dorm) => (
            <div
              key={dorm.id}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 group transition-all hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] hover:-translate-y-1"
            >
              {/* IMAGE HEADER */}
              <div className="relative h-48 overflow-hidden">
                {dorm.images?.[0] ? (
                  <Image
                    src={dorm.images[0]}
                    alt={dorm.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-200" />
                  </div>
                )}
                
                {/* Visual Overlays */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Status Toggle */}
                <button
                  onClick={() => toggleAvailability(dorm.id, dorm.availability)}
                  className={`absolute top-4 left-4 px-4 py-2 rounded-2xl text-[9px] font-bold uppercase tracking-[0.2em] backdrop-blur-md shadow-lg transition-all ${
                    dorm.availability === 'available'
                      ? 'bg-emerald-500/90 text-white shadow-emerald-500/20'
                      : 'bg-neutral-dark/90 text-white'
                  }`}
                >
                  {dorm.availability}
                </button>

                {/* Price Display */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-xl flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">₱</span>
                  <span className="text-lg font-bold text-neutral-dark tracking-tight">{(dorm.price || 0).toLocaleString()}</span>
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest ml-1">/mo</span>
                </div>
              </div>

              {/* DETAILS CONTENT */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-dark tracking-tight mb-2 group-hover:text-primary transition-colors">
                  {dorm.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-400 mb-6">
                  <MapPin className="w-4 h-4 text-primary/60" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] truncate">{dorm.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-[0.2em] block mb-0.5">Gender Policy</span>
                      <span className="text-[10px] font-bold text-neutral-dark uppercase truncate">{dorm.gender_policy}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-[0.2em] block mb-0.5">Category</span>
                      <span className="text-[10px] font-bold text-neutral-dark uppercase truncate">{dorm.listing_type}</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BAR */}
                <div className="flex gap-2">
                  <Link
                    href={`/owner/listings/edit/${dorm.id}`}
                    className="flex-1 bg-white border border-gray-200 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-dark hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <Link
                    href={`/owner/listings/${dorm.id}`}
                    className="flex-1 bg-neutral-dark text-white py-3.5 rounded-2xl flex items-center justify-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-black/10"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </Link>
                  <button
                    onClick={() => setConfirmModal({ isOpen: true, id: dorm.id, name: dorm.name })}
                    className="w-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Property?"
        message={`This will permanently remove "${confirmModal.name}". This action cannot be undone.`}
        confirmText="Confirm Delete"
        onConfirm={processDelete}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        variant="danger"
      />
    </div>
  );
}
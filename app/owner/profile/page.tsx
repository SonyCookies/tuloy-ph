//app\owner\profile\page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Camera,
  Mail,
  Home,
  CheckCircle2,
  Upload
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AvatarUploadModal from '@/app/components/ui/AvatarUploadModal';
import { getFullAddress } from '@/lib/address-utils';
import SuccessModal from '@/app/components/ui/SuccessModal';
import ConfirmModal from '@/app/components/ui/ConfirmModal';
import ProfileSkeleton from '@/app/components/ui/ProfileSkeleton';

export default function OwnerProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobile: ''
  });

  const [tempFile, setTempFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('User')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          // Enrich data with human-readable address names
          const names = await getFullAddress({
            region: data.address_region,
            province: data.address_province,
            city: data.address_city,
            barangay: data.address_barangay
          });

          setUserData({
            ...data,
            address_region_name: names.region,
            address_province_name: names.province,
            address_city_name: names.city,
            address_barangay_name: names.barangay
          });

          setFormData({
            name: data.name || '',
            mobile: data.mobile || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+63')) value = '+63' + value.replace(/\+63/g, '').replace(/\D/g, '');
    else value = '+63' + value.slice(3).replace(/\D/g, '');
    if (value.length <= 13) setFormData({ ...formData, mobile: value });
  };

  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsSaving(true);
      setShowConfirm(false);

      const { error: updateError } = await supabase
        .from('User')
        .update({
          name: formData.name,
          mobile: formData.mobile,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await supabase.auth.updateUser({
        data: { full_name: formData.name }
      });

      setUserData((prev: any) => ({
        ...prev,
        name: formData.name,
        mobile: formData.mobile
      }));

      setShowSuccess(true);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(error.message || 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTempFile(file);
    setShowEditor(true);
  };

  const saveAvatar = async (file: File, preview: string) => {
    setAvatarPreview(preview);
    setShowEditor(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileName = `${user.id}/${Date.now()}-avatar.png`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error(uploadError);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('User')
        .update({ image: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error(updateError);
        return;
      }

      setUserData((prev: any) => ({ ...prev, image: publicUrl }));
      setShowSuccess(true);
    } catch (error) {
      console.error('Error saving avatar:', error);
    }
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-32 animate-in fade-in slide-in-from-bottom-5 duration-700">

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
          {/* Cover Area / Header */}
          <div className="h-32 bg-gradient-to-br from-secondary/10 to-primary/5 relative">
            <div className="absolute top-4 right-6 flex items-center gap-2">
            </div>
          </div>

          <div className="px-8 pb-8 flex flex-col items-center text-center -mt-16 relative z-10">
            {/* Avatar Group */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
                <Image
                  src={avatarPreview || userData?.image || userData?.avatar || '/placeholder-avatar.png'}
                  alt="Profile Picture"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <button
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-neutral-dark text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="mt-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-transparent text-2xl font-black text-neutral-dark text-center outline-none w-full border-b-2 border-transparent focus:border-primary/20 transition-all"
                placeholder="Your Name"
              />
              <div className="flex items-center justify-center gap-2 text-gray-400 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Dormitory Owner</span>
              </div>
            </div>
          </div>

          {/* Info Sections */}
          <div className="border-t border-gray-50 px-8 py-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Contact Number */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</span>
                <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-200 transition-all group">
                  <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={handleMobileChange}
                    className="bg-transparent text-sm font-bold text-neutral-dark flex-1 outline-none"
                    placeholder="Not set"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Registered Address</span>
              <div className="flex items-center gap-4 p-5 bg-gray-50/50 rounded-3xl border border-transparent hover:border-gray-200 transition-all group">
                <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-dark">
                    Barangay {userData?.address_barangay_name || '---'}, {userData?.address_city_name || '---'}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                    {userData?.address_province_name || '---'} Province, {userData?.address_region_name || '---'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isSaving}
            className="w-full bg-neutral-dark text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
            {!isSaving && <ChevronRight className="w-4 h-4" />}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-100 transition-all flex items-center justify-center gap-3"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>


      {showEditor && tempFile && (
        <AvatarUploadModal
          file={tempFile}
          onClose={() => setShowEditor(false)}
          onSave={saveAvatar}
        />
      )}

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Profile Updated"
        message="Your profile changes have been saved successfully."
      />

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSaveProfile}
        title="Save Changes?"
        message="Are you sure you want to update your profile details? This action will save your new information."
        confirmText="Yes, Save"
        cancelText="Cancel"
        variant="info"
      />
    </div>
  );
}

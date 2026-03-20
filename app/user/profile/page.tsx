'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  User,
  Phone,
  Camera,
  Upload,
  CheckCircle2,
  LogOut,
  MapPin,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AvatarUploadModal from '@/app/components/ui/AvatarUploadModal';
import { getFullAddress } from '@/lib/address-utils';
import SuccessModal from '@/app/components/ui/SuccessModal';
import ConfirmModal from '@/app/components/ui/ConfirmModal';
import ProfileSkeleton from '@/app/components/ui/ProfileSkeleton';

export default function UserProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userAuth, setUserAuth] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    address: ''
  });

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/auth/login');
        setUserAuth(user);

        const { data: profile } = await supabase
          .from('User')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          const { barangay, city, province, region } = await getFullAddress({
            barangay: profile.address_barangay,
            city: profile.address_city,
            province: profile.address_province,
            region: profile.address_region
          });
          
          setFormData({
            fullName: profile.name || '',
            mobileNumber: profile.mobile || '',
            address: `${barangay || ''}, ${city || ''}, ${province || ''}, ${region || ''}`
          });
          
          // Store raw names in state for structured display
          (setFormData as any)((prev: any) => ({
            ...prev,
            addressDetails: { barangay, city, province, region }
          }));
          
          setAvatarPreviewUrl(profile.image || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+63')) value = '+63' + value.replace(/\+63/g, '').replace(/\D/g, '');
    else value = '+63' + value.slice(3).replace(/\D/g, '');
    if (value.length <= 13) setFormData({ ...formData, mobileNumber: value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setTempFile(file); setShowEditor(true); }
  };

  const handleSaveAvatar = (file: File, preview: string) => {
    setAvatarFile(file);
    setAvatarPreviewUrl(preview);
    setShowEditor(false);
    setTempFile(null);
  };

  const handleSaveProfile = async () => {
    if (!userAuth) return;
    setIsSaving(true);
    setShowConfirm(false);
    try {
      let finalAvatarUrl = avatarPreviewUrl;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userAuth.id}/${Date.now()}-avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { cacheControl: '3600', upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
          finalAvatarUrl = publicUrl;
        }
      }

      await supabase
        .from('User')
        .update({
          name: formData.fullName,
          image: finalAvatarUrl,
          mobile: formData.mobileNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', userAuth.id);

      await supabase.auth.updateUser({
        data: { full_name: formData.fullName, avatar_url: finalAvatarUrl }
      });

      setShowSuccess(true);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-32 animate-in fade-in slide-in-from-bottom-5 duration-700">

      <div className="space-y-6">

        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">

          {/* Cover */}
          <div className="h-32 bg-gradient-to-br from-secondary/10 to-primary/5 relative">
            <div className="absolute top-4 right-6">
            </div>
          </div>

          {/* Avatar */}
          <div className="px-8 pb-2 flex flex-col items-center text-center -mt-16 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
                {avatarPreviewUrl ? (
                  <Image src={avatarPreviewUrl} alt="Avatar" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              <button
                onClick={() => document.getElementById('profile-avatar-upload')?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-neutral-dark text-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input id="profile-avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </div>

            <div className="mt-4">
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-transparent text-2xl font-black text-neutral-dark text-center outline-none w-full border-b-2 border-transparent focus:border-primary/20 transition-all"
                placeholder="Your Name"
              />
            </div>
          </div>

          {/* Form Sections */}
          <div className="border-t border-gray-50 px-8 py-6 space-y-6">



            {/* Mobile */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</span>
              <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-200 transition-all group">
                <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={handleMobileChange}
                  className="flex-1 bg-transparent text-sm font-bold text-neutral-dark outline-none"
                />
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
                    Barangay {(formData as any).addressDetails?.barangay || '---'}, {(formData as any).addressDetails?.city || '---'}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                    {(formData as any).addressDetails?.province || '---'} Province, {(formData as any).addressDetails?.region || '---'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isSaving}
          className="w-full bg-neutral-dark text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
          {!isSaving && <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="w-full bg-red-50 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-100 transition-all flex items-center justify-center gap-3"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

      </div>

      {showEditor && tempFile && (
        <AvatarUploadModal
          file={tempFile}
          onClose={() => setShowEditor(false)}
          onSave={handleSaveAvatar}
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
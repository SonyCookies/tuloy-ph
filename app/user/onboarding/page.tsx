'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Camera,
  Upload,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import LoadingModal from '@/app/components/ui/LoadingModal';
import AvatarUploadModal from '@/app/components/ui/AvatarUploadModal';
import { supabase } from '@/lib/supabase';

export default function UserOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '+63',
    region: '',
    province: '',
    city: '',
    barangay: '',
  });

  const [regions, setRegions] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  React.useEffect(() => {
    fetch('/ph-json/region.json')
      .then(res => res.json())
      .then(data => setRegions(data));
  }, []);

  React.useEffect(() => {
    if (formData.region) {
      fetch('/ph-json/province.json')
        .then(res => res.json())
        .then(data => {
          setProvinces(data.filter((p: any) => p.region_code === formData.region)
            .sort((a: any, b: any) => a.province_name.localeCompare(b.province_name)));
          setFormData(prev => ({ ...prev, province: '', city: '', barangay: '' }));
        });
    }
  }, [formData.region]);

  React.useEffect(() => {
    if (formData.province) {
      fetch('/ph-json/city.json')
        .then(res => res.json())
        .then(data => {
          setCities(data.filter((c: any) => c.province_code === formData.province)
            .sort((a: any, b: any) => a.city_name.localeCompare(b.city_name)));
          setFormData(prev => ({ ...prev, city: '', barangay: '' }));
        });
    }
  }, [formData.province]);

  React.useEffect(() => {
    if (formData.city) {
      fetch('/ph-json/barangay.json')
        .then(res => res.json())
        .then(data => {
          setBarangays(data.filter((b: any) => b.city_code === formData.city)
            .sort((a: any, b: any) => a.brgy_name.localeCompare(b.brgy_name)));
          setFormData(prev => ({ ...prev, barangay: '' }));
        });
    }
  }, [formData.city]);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+63')) {
      value = '+63' + value.replace(/\+63/g, '').replace(/\D/g, '');
    } else {
      value = '+63' + value.slice(3).replace(/\D/g, '');
    }
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

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let finalAvatarUrl = '';
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { cacheControl: '3600', upsert: true });
        if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalAvatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('User')
        .update({
          name: formData.fullName,
          image: finalAvatarUrl || null,
          mobile: formData.mobileNumber,
          address_region: formData.region,
          address_province: formData.province,
          address_city: formData.city,
          address_barangay: formData.barangay,
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw new Error(`Profile update failed: ${updateError.message}`);

      await supabase.auth.updateUser({
        data: { onboarding_complete: true, avatar_url: finalAvatarUrl }
      });

      router.push('/user');
    } catch (error: any) {
      console.error('Onboarding Error:', error);
      alert(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/backgrounds/tuloyphonboardingbg.svg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-8 flex flex-col items-center min-h-screen">

        {/* Header */}
        <div className="w-full mb-6 flex flex-col gap-3 text-center">
          <div className="space-y-1">
            <span className="text-secondary font-black text-[9px] uppercase tracking-[0.2em] bg-secondary/5 px-2.5 py-1 rounded-full inline-block">
              Step {step} of 2
            </span>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
              {step === 1 && "Complete Your Profile"}
              {step === 2 && (
                <span className="flex items-center gap-2 justify-center">
                  You're All Set! <CheckCircle2 className="w-6 h-6 text-secondary" />
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-700 ${
                  s === step ? 'w-10 bg-primary shadow-sm shadow-primary/20'
                    : s < step ? 'w-5 bg-secondary'
                    : 'w-5 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">

              {/* Avatar Upload */}
              <div className="p-6 border-b border-gray-100 flex flex-col items-center gap-3">
                <div
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className="relative group cursor-pointer"
                >
                  <div className="w-24 h-24 rounded-xl bg-gray-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center transition-all group-hover:scale-105 duration-500">
                    {avatarPreviewUrl ? (
                      <img src={avatarPreviewUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-7 h-7 text-gray-300 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                  <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {avatarPreviewUrl ? 'Change Photo' : 'Upload Profile Photo'}
                </span>
              </div>

              {/* Full Name */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</span>
                  <input
                    type="text"
                    placeholder="Juana Dela Cruz"
                    maxLength={100}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</span>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={handleMobileChange}
                    className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="bg-gray-50/30">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Region</span>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        className="bg-transparent text-[11px] font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full"
                      >
                        <option value="" disabled>Select Region</option>
                        {regions.map(r => (
                          <option key={r.region_code} value={r.region_code}>{r.region_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Province</span>
                      <select
                        value={formData.province}
                        disabled={!formData.region}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        className="bg-transparent text-[11px] font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full disabled:opacity-30"
                      >
                        <option value="" disabled>Select Province</option>
                        {provinces.map(p => (
                          <option key={p.province_code} value={p.province_code}>{p.province_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-14 py-3 border-b border-gray-100 grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">City</span>
                    <select
                      value={formData.city}
                      disabled={!formData.province}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="bg-transparent text-[11px] font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full disabled:opacity-30"
                    >
                      <option value="" disabled>Select City</option>
                      {cities.map(c => (
                        <option key={c.city_code} value={c.city_code}>{c.city_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Barangay</span>
                    <select
                      value={formData.barangay}
                      disabled={!formData.city}
                      onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                      className="bg-transparent text-[11px] font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full disabled:opacity-30"
                    >
                      <option value="" disabled>Select Barangay</option>
                      {barangays.map(b => (
                        <option key={b.brgy_code} value={b.brgy_code}>{b.brgy_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-3">
                <button
                  onClick={nextStep}
                  disabled={!formData.fullName || formData.mobileNumber.length < 13 || !formData.barangay}
                  className="w-full bg-primary hover:opacity-90 active:scale-[0.98] text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-20 disabled:pointer-events-none"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 p-8 flex flex-col items-center text-center gap-6">
              
              {/* Avatar Preview */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-primary/10 flex items-center justify-center">
                {avatarPreviewUrl ? (
                  <img src={avatarPreviewUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-primary">
                    {formData.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{formData.fullName}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">User · Tuloy PH Member</p>
              </div>

              {/* Summary Fields */}
              <div className="w-full space-y-3 text-left">
                {[
                  { label: 'Mobile', value: formData.mobileNumber },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                    <span className="text-xs font-black text-neutral-dark">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="w-full p-4 bg-secondary/5 rounded-xl border border-secondary/10 flex items-start gap-4 text-left">
                <AlertCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-secondary/80 leading-tight uppercase tracking-widest">
                  Your profile is now active. You can start browsing and saving dorms immediately.
                </p>
              </div>

              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-primary hover:opacity-90 active:scale-[0.98] text-white py-3.5 rounded-xl font-black text-sm shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  Go to My Dashboard
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={prevStep}
                  className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-gray-500 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <LoadingModal isOpen={isLoading} message="Setting up your account..." />

      {showEditor && tempFile && (
        <AvatarUploadModal
          file={tempFile}
          onClose={() => setShowEditor(false)}
          onSave={handleSaveAvatar}
        />
      )}
    </div>
  );
}

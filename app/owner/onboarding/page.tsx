//app\owner\onboarding\page.tsx

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper, { Area } from 'react-easy-crop';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  User, 
  Phone, 
  MapPin, 
  FileCheck, 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  AlertCircle,
  Camera,
  IdCard,
  X,
  RotateCw,
  ZoomIn
} from 'lucide-react';
import LoadingModal from '@/app/components/ui/LoadingModal';
import { supabase } from '@/lib/supabase';
import AvatarUploadModal from '@/app/components/ui/AvatarUploadModal';

export default function OwnerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '+63',
    region: '',
    province: '',
    city: '',
    barangay: '',
    idType: '',
  });

  // Address Selector Data
  const [regions, setRegions] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  // Fetch Regions on mount
  React.useEffect(() => {
    fetch('/ph-json/region.json')
      .then(res => res.json())
      .then(data => setRegions(data))
      .catch(err => console.error('Error fetching regions:', err));
  }, []);

  // Fetch Provinces when region changes
  React.useEffect(() => {
    if (formData.region) {
      fetch('/ph-json/province.json')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter((p: any) => p.region_code === formData.region);
          setProvinces(filtered.sort((a: any, b: any) => a.province_name.localeCompare(b.province_name)));
          setFormData(prev => ({ ...prev, province: '', city: '', barangay: '' }));
        });
    }
  }, [formData.region]);

  // Fetch Cities when province changes
  React.useEffect(() => {
    if (formData.province) {
      fetch('/ph-json/city.json')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter((c: any) => c.province_code === formData.province);
          setCities(filtered.sort((a: any, b: any) => a.city_name.localeCompare(b.city_name)));
          setFormData(prev => ({ ...prev, city: '', barangay: '' }));
        });
    }
  }, [formData.province]);

  // Fetch Barangays when city changes
  React.useEffect(() => {
    if (formData.city) {
      fetch('/ph-json/barangay.json')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter((b: any) => b.city_code === formData.city);
          setBarangays(filtered.sort((a: any, b: any) => a.brgy_name.localeCompare(b.brgy_name)));
          setFormData(prev => ({ ...prev, barangay: '' }));
        });
    }
  }, [formData.city]);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Always keep +63
    if (!value.startsWith('+63')) {
      value = '+63' + value.replace(/\+63/g, '').replace(/\D/g, '');
    } else {
      value = '+63' + value.slice(3).replace(/\D/g, '');
    }
    // Limit to +63 + 10 digits (13 chars total)
    if (value.length <= 13) {
      setFormData({ ...formData, mobileNumber: value });
    }
  };
  
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  
  // Avatar Editor State
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempFile(file);
      setShowEditor(true);
    }
  };

  const handleSaveAvatar = (file: File, preview: string) => {
    setAvatarFile(file);
    setAvatarPreviewUrl(preview);
    setShowEditor(false);
    setTempFile(null);
  };

  // ID Editor State
  const [idImage, setIdImage] = useState<string | null>(null);
  const [idCrop, setIdCrop] = useState({ x: 0, y: 0 });
  const [idZoom, setIdZoom] = useState(1);
  const [idCroppedAreaPixels, setIdCroppedAreaPixels] = useState<Area | null>(null);
  const [showIdCropper, setShowIdCropper] = useState(false);

  const onDropId = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setIdImage(reader.result as string);
        setShowIdCropper(true);
      });
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropId,
    accept: {
      'image/jpeg': [],
      'image/jpg': [],
      'image/png': [],
      'image/webp': []
    },
    multiple: false
  });

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setIdCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const handleSaveId = async () => {
    try {
      if (!idImage || !idCroppedAreaPixels) return;
      const image = await createImage(idImage);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = idCroppedAreaPixels.width;
      canvas.height = idCroppedAreaPixels.height;

      ctx.drawImage(
        image,
        idCroppedAreaPixels.x,
        idCroppedAreaPixels.y,
        idCroppedAreaPixels.width,
        idCroppedAreaPixels.height,
        0,
        0,
        idCroppedAreaPixels.width,
        idCroppedAreaPixels.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "id_verification.png", { type: "image/png" });
          setIdFile(file);
          setIdPreviewUrl(URL.createObjectURL(blob));
          setShowIdCropper(false);
          setIdImage(null);
        }
      }, "image/png");
    } catch (e) {
      console.error(e);
    }
  };

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setIdImage(reader.result as string);
        setShowIdCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Upload Profile Photo (Public Bucket)
      let finalAvatarUrl = '';
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-avatar.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        finalAvatarUrl = publicUrl;
      }

      // 2. Upload ID Image (Private Bucket for security)
      let finalIdPath = '';
      if (idFile) {
        const fileExt = idFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-verification.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('verifications')
          .upload(fileName, idFile, {
            upsert: true
          });
          
        if (uploadError) throw new Error(`ID upload failed: ${uploadError.message}`);
        finalIdPath = fileName;
      }

      // 3. Sync to Database
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
          id_type: formData.idType,
          id_storage_path: finalIdPath,
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw new Error(`Database update failed: ${updateError.message}`);

      // 4. Update Auth Metadata for session persistent data
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          onboarding_complete: true,
          mobile: formData.mobileNumber,
          avatar_url: finalAvatarUrl,
          is_verified: 'pending' 
        }
      });

      if (authError) console.warn('Auth metadata update failed, but profile was saved:', authError.message);

      router.push('/owner');
    } catch (error: any) {
      console.error('Onboarding Error:', error);
      alert(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/20">
      {/* 1. Locked Brand Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/backgrounds/tuloyphonboardingbg.svg"
          alt="Tuloy PH Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-16 flex flex-col items-center">
        
        {/* Progress Header - Now Stacked Vertically */}
        <div className="w-full max-w-md mb-6 flex flex-col gap-3 text-center md:text-left">
          <div className="space-y-1">
            <span className="text-secondary font-black text-[9px] uppercase tracking-[0.2em] bg-secondary/5 px-2.5 py-1 rounded-full inline-block">Step {step} of 3</span>
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
              {step === 1 && "Complete your Profile"}
              {step === 2 && "Identity Verification"}
              {step === 3 && (
                <span className="flex items-center gap-2 justify-center md:justify-start">
                  All Set! <CheckCircle2 className="w-6 h-6 text-secondary" />
                </span>
              )}
            </h2>
          </div>

          {/* Progress Indicators - Below h2 */}
          <div className="flex items-center justify-center md:justify-start gap-1.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
                  s === step 
                    ? 'w-10 bg-primary shadow-sm shadow-primary/20' 
                    : s < step 
                      ? 'w-5 bg-secondary' 
                      : 'w-5 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full max-w-md relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/5 via-secondary/5 to-primary/5 rounded-xl blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col">
                
                {/* Profile Photo - Integrated into card header style */}
                <div className="p-6 border-b border-gray-100 flex flex-col items-center gap-3">
                  <div 
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    className="relative group cursor-pointer"
                  >
                    <div className="w-24 h-24 rounded-xl bg-gray-50 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden transition-all group-hover:scale-105 duration-500">
                      {avatarPreviewUrl ? (
                        <img src={avatarPreviewUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-7 h-7 text-gray-300 transition-colors group-hover:text-primary" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-xl shadow-lg active:scale-95 transition-all border-2 border-white">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {avatarPreviewUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}
                  </span>
                </div>

                {/* Compact Field: Name */}
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
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Compact Field: Phone */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</span>
                    <div className="flex items-center">
                      <input 
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={handleMobileChange}
                        className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Selectors */}
                <div className="bg-gray-50/30">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                      <MapPin className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      {/* Region */}
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Region</span>
                        <select
                          value={formData.region}
                          onChange={(e) => setFormData({...formData, region: e.target.value})}
                          className="bg-transparent text-[11px] font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full"
                        >
                          <option value="" disabled>Select Region</option>
                          {regions.map(r => (
                            <option key={r.region_code} value={r.region_code}>{r.region_name}</option>
                          ))}
                        </select>
                      </div>
                      {/* Province */}
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Province</span>
                        <select
                          value={formData.province}
                          disabled={!formData.region}
                          onChange={(e) => setFormData({...formData, province: e.target.value})}
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
                    {/* City */}
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">City</span>
                      <select
                        value={formData.city}
                        disabled={!formData.province}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="bg-transparent text-[11px] font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full disabled:opacity-30"
                      >
                        <option value="" disabled>Select City</option>
                        {cities.map(c => (
                          <option key={c.city_code} value={c.city_code}>{c.city_name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Barangay */}
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-loose">Barangay</span>
                      <select
                        value={formData.barangay}
                        disabled={!formData.city}
                        onChange={(e) => setFormData({...formData, barangay: e.target.value})}
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

                <div className="p-4 pt-1">
                  <button 
                    onClick={nextStep}
                    disabled={!formData.fullName || formData.mobileNumber.length < 13 || !formData.barangay}
                    className="w-full bg-primary hover:opacity-90 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-20 disabled:pointer-events-none"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-12 duration-500">
              <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col">
                
                <div className="p-6 border-b border-gray-100 flex flex-col gap-2 text-center items-center">
                  <div className="p-3 bg-secondary/5 rounded-xl">
                    <IdCard className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">ID Verification</h3>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-[240px] mt-0.5 mx-auto">
                      Trusted listings start with verified owners. Please upload a valid ID.
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select ID Type</span>
                    <div className="grid grid-cols-2 gap-2">
                      {['Passport', "Driver's License", 'National ID', 'UMID'].map((id) => (
                        <button
                          key={id}
                          onClick={() => setFormData({...formData, idType: id})}
                          className={`py-2.5 px-3 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all border ${
                            formData.idType === id 
                              ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20 scale-105' 
                              : 'bg-gray-50/50 border-transparent text-neutral-dark/30 hover:bg-gray-50 hover:text-neutral-dark/60'
                          }`}
                        >
                          {id}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Upload ID Image</span>
                    <div 
                      {...getRootProps()}
                      className={`relative w-full aspect-[16/9] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden duration-300 ${
                        isDragActive 
                          ? 'border-primary bg-primary/5' 
                          : idPreviewUrl 
                            ? 'border-secondary bg-secondary/5' 
                            : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {idPreviewUrl ? (
                        <img src={idPreviewUrl} alt="ID Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
                          <Upload className={`w-6 h-6 transition-colors ${isDragActive ? 'text-primary' : 'text-primary/30'}`} />
                        </div>
                      )}
                      
                      <div className="relative z-10 text-center px-4 py-2">
                        <p className={`font-bold tracking-tight text-[10px] uppercase ${idPreviewUrl ? 'text-secondary bg-white/90 px-3 py-1.5 rounded-xl shadow-sm' : isDragActive ? 'text-primary' : 'text-gray-400'}`}>
                          {idPreviewUrl ? 'Change Photo' : isDragActive ? 'Drop image here' : 'Drag or Click to Upload'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 p-2">
                  <button 
                    onClick={prevStep}
                    className="flex-1 bg-gray-50 text-neutral-dark/30 px-5 py-4 rounded-xl font-bold hover:bg-gray-100 hover:text-neutral-dark/60 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.idType || !idFile}
                    className="flex-[3] bg-secondary text-white py-4 rounded-xl font-black text-base shadow-2xl shadow-secondary/20 hover:bg-secondary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:pointer-events-none"
                  >
                    Finish Setup
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 p-8 flex flex-col items-center text-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-gray-900">You're ready to list!</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                    Your details are saved. You can now start adding your dormitories.
                  </p>
                </div>

                <div className="w-full p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-4 text-left">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-primary/80 leading-tight uppercase tracking-widest">
                    Verification takes ~24 hours. Listings remain private during review.
                  </p>
                </div>

                <button 
                  onClick={handleSubmit}
                  className="w-full bg-primary hover:opacity-90 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      
      <LoadingModal isOpen={isLoading} message="Synchronizing account..." />

      {/* Avatar Editor Modal */}
      {showEditor && tempFile && (
        <AvatarUploadModal
          file={tempFile}
          onClose={() => setShowEditor(false)}
          onSave={handleSaveAvatar}
        />
      )}

      {/* ID Cropper Modal */}
      {showIdCropper && idImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-neutral-dark/40 backdrop-blur-sm" onClick={() => setShowIdCropper(false)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-secondary font-black text-[9px] uppercase tracking-[0.2em]">ID Verification</span>
                <h3 className="text-lg font-black text-neutral-dark">Crop ID Image</h3>
              </div>
              <button 
                onClick={() => setShowIdCropper(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cropper Body */}
            <div className="p-6">
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-gray-900 border border-gray-100">
                <Cropper
                  image={idImage}
                  crop={idCrop}
                  zoom={idZoom}
                  aspect={16 / 10}
                  onCropChange={setIdCrop}
                  onZoomChange={setIdZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Controls */}
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5" /> Adjust Zoom</span>
                    <span>{(idZoom * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={idZoom}
                    onChange={(e) => setIdZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 bg-gray-50/50 flex gap-3">
              <button 
                onClick={() => setShowIdCropper(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveId}
                className="flex-[2] bg-primary text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Save ID Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Upload, 
  ChevronRight, 
  MapPin, 
  Wifi, 
  Info, 
  Users, 
  Clock, 
  ShieldAlert,
  Home,
  Star,
  Plus,
  X,
  ChevronLeft,
  Camera,
  Heart,
  CheckCircle2
} from "lucide-react";
import StatusModal from '@/app/components/auth/StatusModal';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/app/components/ui/MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-300">Loading Map...</div>
});

export default function AddListingPage({ mode = "create" }: { mode?: "create" | "edit" }) {
  const params = useParams();
  const listingId = params?.id;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");

  
  // Status Modal State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: null,
    title: '',
    message: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    genderPolicy: 'mixed',
    curfew: '',
    availability: 'available',
    region: '',
    province: '',
    city: '',
    barangay: '',
    exactAddress: '',
    listingType: 'whole',
    lat: null as number | null,
    lng: null as number | null,
    rule_ids: [] as string[]
  });

  const [inheritedRules, setInheritedRules] = useState<any[]>([]);

  // Photo State
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Address Selector Data
  const [regions, setRegions] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  const [amenities, setAmenities] = useState<string[]>([]);
  const [houseRules, setHouseRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');

  // Fetch Regions
  useEffect(() => {
    fetch('/ph-json/region.json')
      .then(res => res.json())
      .then(data => setRegions(data));
  }, []);

  // Filter Provinces
  useEffect(() => {
    if (formData.region) {
      fetch('/ph-json/province.json')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter((p: any) => p.region_code === formData.region);
          setProvinces(filtered.sort((a: any, b: any) => a.province_name.localeCompare(b.province_name)));
        });
    }
  }, [formData.region]);

  // Filter Cities
  useEffect(() => {
    if (formData.province) {
      fetch('/ph-json/city.json')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter((c: any) => c.province_code === formData.province);
          setCities(filtered.sort((a: any, b: any) => a.city_name.localeCompare(b.city_name)));
        });
    }
  }, [formData.province]);

  // Filter Barangays
  useEffect(() => {
    if (formData.city) {
      fetch('/ph-json/barangay.json')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter((b: any) => b.city_code === formData.city);
          setBarangays(filtered.sort((a: any, b: any) => a.brgy_name.localeCompare(b.brgy_name)));
        });
    }
  }, [formData.city]);

  useEffect(() => {
  if (mode !== "edit" || !listingId) return;

  const fetchListing = async () => {
    setIsFetching(true); // ✅ use this instead
    try {
      const { data, error } = await supabase
        .from('Dorm')
        .select('*')
        .eq('id', listingId)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || '',
        price: data.price?.toString() || '',
        description: data.description || '',
        genderPolicy: data.gender_policy || 'mixed',
        curfew: data.curfew || '',
        availability: data.availability || 'available',
        region: data.address_region || '',
        province: data.address_province || '',
        city: data.address_city || '',
        barangay: data.address_barangay || '',
        exactAddress: data.exact_address || '',
        listingType: data.listing_type || 'whole',
        lat: data.latitude,
        lng: data.longitude,
        rule_ids: data.rule_ids || []
      });

      if (data.rule_ids?.length > 0) {
        const { data: inheritedData } = await supabase
          .from('HouseRule')
          .select('*')
          .in('id', data.rule_ids);
        setInheritedRules(inheritedData || []);
      }

      setAmenities(data.amenities || []);
      setHouseRules(data.rules || []);
      if (data.images) setPreviews(data.images);

    } catch (err) {
      console.error('Error fetching listing:', err);
    } finally {
      setIsFetching(false); // ✅ done loading
    }
  };

  fetchListing();
  }, [mode, listingId]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPhotos(prev => [...prev, ...acceptedFiles]);
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 8
  });

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const toggleAmenity = (item: string) => {
    setAmenities(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const addHouseRule = () => {
    if (newRule.trim()) {
      setHouseRules([...houseRules, newRule.trim()]);
      setNewRule('');
    }
  };

  const removeHouseRule = (index: number) => {
    setHouseRules(houseRules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Upload Photos
      const uploadedImageUrls = [];
      for (const file of photos) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('dorms')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('dorms')
          .getPublicUrl(fileName);
        
        uploadedImageUrls.push(publicUrl);
      }

      // 2. Format Location String for display
      const cityName = cities.find(c => c.city_code === formData.city)?.city_name || '';
      const provinceName = provinces.find(p => p.province_code === formData.province)?.province_name || '';
      const barangayName = barangays.find(b => b.brgy_code === formData.barangay)?.brgy_name || '';
      const formattedLocation = `${barangayName}, ${cityName}, ${provinceName}`;

      // 3. Update or Insert into DB
      if (mode === "edit") {
        const { error } = await supabase
          .from('Dorm')
          .update({
            name: formData.name,
            price: parseInt(formData.price.replace(/,/g, '')),
            description: formData.description,
            location: formattedLocation,
            address_region: formData.region,
            address_province: formData.province,
            address_city: formData.city,
            address_barangay: formData.barangay,
            exact_address: formData.exactAddress,
            gender_policy: formData.genderPolicy,
            listing_type: formData.listingType,
            curfew: formData.curfew,
            availability: formData.availability,
            amenities: amenities,
            rules: houseRules,
            latitude: formData.lat,
            longitude: formData.lng,
            rule_ids: formData.rule_ids,
            // Only update images if we have new ones or removed some. 
            // previews should contain the final desired set of URLs.
            // But previews currently contains blob URLs for new photos.
            // Let's filter out blob URLs and add the new public URLs.
            images: [
              ...previews.filter(p => !p.startsWith('blob:')),
              ...uploadedImageUrls
            ]
          })
          .eq('id', listingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('Dorm')
          .insert([
            {
              name: formData.name,
              price: parseInt(formData.price.replace(/,/g, '')),
              description: formData.description,
              owner_id: user.id,
              location: formattedLocation,
              address_region: formData.region,
              address_province: formData.province,
              address_city: formData.city,
              address_barangay: formData.barangay,
              exact_address: formData.exactAddress,
              gender_policy: formData.genderPolicy,
              listing_type: formData.listingType,
              curfew: formData.curfew,
              availability: formData.availability,
              amenities: amenities,
              rules: houseRules,
              images: uploadedImageUrls,
              latitude: formData.lat,
              longitude: formData.lng,
              rule_ids: formData.rule_ids,
              created_at: new Date().toISOString(),
            }
          ]);

        if (error) throw error;
      }
      
      // Success Outcome
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: mode === 'edit' ? 'Listing Updated!' : 'Listing Published!',
        message: mode === 'edit' ? 'Your property details have been successfully updated.' : 'Your property is now live and visible to students searching for their next home.'
      });
    } catch (error: any) {
      console.error('Error adding dorm:', error);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: mode === 'edit' ? 'Update Failed' : 'Publishing Failed',
        message: error.message || (mode === 'edit' ? 'We encountered an error while updating your listing. Please try again.' : 'We encountered an error while saving your listing. Please try again.')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const FormSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      
      {/* Step Indicator */}
      <div className="flex gap-2 mb-8">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        <div className="w-6 h-1.5 bg-gray-200 rounded-full"></div>
        <div className="w-6 h-1.5 bg-gray-200 rounded-full"></div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
        
        {/* Input rows */}
        {[1,2,3,4].map(i => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="w-24 h-2 bg-gray-200 rounded"></div>
              <div className="w-full h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="h-12 bg-gray-300 rounded-xl"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-32 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-neutral-dark mb-1 tracking-tight">{mode === "edit" ? "Edit Listing" : "Create Listing"}</h1>
        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.15em] opacity-60">{mode === "edit" ? "Update your property details" : "Complete the details below"}</p>
      </div>

      {isFetching ? (
        <FormSkeleton />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">        
              {/* Step Indicators */}
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      s === step ? 'w-12 bg-primary shadow-lg shadow-primary/20' : s < step ? 'w-6 bg-secondary' : 'w-6 bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  {/* Listing Type Selection */}
                  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.08)] space-y-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-center">What are you listing?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'whole', label: 'Whole Dorm', icon: <Home className="w-4 h-4" /> },
                        { id: 'upper', label: 'Upper Bed', icon: <ChevronRight className="w-4 h-4 -rotate-90" /> },
                        { id: 'lower', label: 'Lower Bed', icon: <ChevronRight className="w-4 h-4 rotate-90" /> },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({...formData, listingType: type.id})}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            formData.listingType === type.id
                              ? 'bg-primary/5 border-primary text-primary shadow-sm'
                              : 'bg-gray-50 border-transparent text-gray-400 opacity-60'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${formData.listingType === type.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white'}`}>
                            {type.icon}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core Details Card */}
                  <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col">
                    {/* Dorm Name Row */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                        <Star className="w-5 h-5 transition-colors group-focus-within:text-primary" />
                      </div>
                      <div className="flex-1 flex flex-col relative">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dormitory Name</span>
                          <span className={`text-[9px] font-black ${formData.name.length >= 90 ? 'text-primary' : 'text-gray-300'}`}>
                            {formData.name.length}/100
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          placeholder="e.g. Crestview Heights"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    {/* Price Row */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 w-10 h-10 flex items-center justify-center font-black text-lg">
                        ₱
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Rent</span>
                        <input
                          type="text"
                          required
                          placeholder="1,000"
                          value={formData.price ? Number(formData.price.replace(/,/g, '')).toLocaleString() : ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/,/g, '');
                            if (/^\d*$/.test(val)) {
                              setFormData({...formData, price: val});
                            }
                          }}
                          className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    {/* Gender Policy Row */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1 flex flex-col uppercase">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender Policy</span>
                        <select
                          value={formData.genderPolicy}
                          onChange={(e) => setFormData({...formData, genderPolicy: e.target.value})}
                          className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full text-left appearance-none"
                        >
                          <option value="male">Male Only</option>
                          <option value="female">Female Only</option>
                          <option value="mixed">Mixed / All</option>
                        </select>
                      </div>
                    </div>

                    {/* Description Row */}
                    <div className="px-4 py-3 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                      <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 mt-1">
                        <Info className="w-5 h-5" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property Description</span>
                          <span className={`text-[9px] font-black ${formData.description.length >= 180 ? 'text-primary' : 'text-gray-300'}`}>
                            {formData.description.length}/200
                          </span>
                        </div>
                        <textarea
                          required
                          maxLength={200}
                          rows={3}
                          placeholder="Describe your property..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300 resize-none pt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.name || !formData.price || !formData.description}
                    className="w-full bg-primary hover:opacity-90 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  {/* Address Card */}
                  <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col">
                    {/* Region Selector */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Region</span>
                        <select
                          required
                          value={formData.region}
                          onChange={(e) => setFormData({...formData, region: e.target.value, province: '', city: '', barangay: ''})}
                          className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full"
                        >
                          <option value="" disabled>Select Region</option>
                          {regions.map(r => (
                            <option key={r.region_code} value={r.region_code}>{r.region_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Province Selector */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Province</span>
                        <select
                          required
                          disabled={!formData.region}
                          value={formData.province}
                          onChange={(e) => setFormData({...formData, province: e.target.value, city: '', barangay: ''})}
                          className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full disabled:opacity-30"
                        >
                          <option value="" disabled>Select Province</option>
                          {provinces.map(p => (
                            <option key={p.province_code} value={p.province_code}>{p.province_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* City Selector */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">City / Municipality</span>
                        <select
                          required
                          disabled={!formData.province}
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value, barangay: ''})}
                          className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full disabled:opacity-30"
                        >
                          <option value="" disabled>Select City</option>
                          {cities.map(c => (
                            <option key={c.city_code} value={c.city_code}>{c.city_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Barangay Selector */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Barangay</span>
                        <select
                          required
                          disabled={!formData.city}
                          value={formData.barangay}
                          onChange={(e) => setFormData({...formData, barangay: e.target.value})}
                          className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full disabled:opacity-30"
                        >
                          <option value="" disabled>Select Barangay</option>
                          {barangays.map(b => (
                            <option key={b.brgy_code} value={b.brgy_code}>{b.brgy_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Exact Address */}
                    <div className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Exact Street / House No.</span>
                        <input
                          type="text"
                          placeholder="e.g. 123 Tuloy St., Central Park"
                          value={formData.exactAddress}
                          onChange={(e) => setFormData({...formData, exactAddress: e.target.value})}
                          className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Map Picker Component - Collapsible */}
                  <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <button 
                      type="button"
                      onClick={() => setShowMap(!showMap)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl transition-colors ${showMap ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400'}`}>
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Precise Location</span>
                          <p className="text-xs font-black text-neutral-dark uppercase tracking-widest">
                            {formData.lat ? 'Location Pinned' : 'Pin on Map'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${showMap ? 'rotate-90' : ''}`} />
                    </button>

                    {showMap && (
                      <div className="p-4 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
                          <MapPicker 
                            lat={formData.lat} 
                            lng={formData.lng} 
                            onChange={(lat, lng) => setFormData({...formData, lat, lng})} 
                          />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-400 py-3.5 rounded-xl font-bold transition-all"
                    >
                      Back
                    </button>
                    <button 
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!formData.barangay}
                      className="flex-[2] bg-primary hover:opacity-90 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                  {/* Multimedia Card */}
                  <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-gray-50 rounded-xl text-primary">
                          <Camera className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property Gallery</span>
                      </div>
                      <span className="text-[10px] font-black text-gray-300">{photos.length}/8</span>
                    </div>

                    <div className="p-4">
                      <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-primary">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-neutral-dark uppercase tracking-widest">Click to Upload</p>
                      </div>

                      {previews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                          {previews.map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100">
                              <Image src={url} alt="Preview" fill className="object-cover" />
                              <button 
                                type="button"
                                onClick={() => removePhoto(i)}
                                className="absolute top-1 right-1 p-1 bg-white/90 backdrop-blur-md rounded-lg shadow-sm text-primary hover:bg-white transition-all"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amenities & Curfew Row Card */}
                  <div className="bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
                    {/* Amenities Row */}
                    <div className="px-4 py-4 border-b border-gray-100 flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-gray-50 rounded-xl text-secondary">
                            <Wifi className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amenities Included</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-14">
                          {['Wifi', 'Aircon', 'Bath', 'Kitchen', 'Gym', 'Laundry', 'Parking', 'Security', 'Water', 'Electricity'].map((item) => (
                            <button 
                              key={item}
                              type="button"
                              onClick={() => toggleAmenity(item)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                amenities.includes(item)
                                  ? 'bg-secondary text-white border-secondary shadow-sm shadow-secondary/20'
                                  : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100 text-neutral-dark/40'
                              }`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                    </div>

                      {/* Curfew Row */}
                      <div className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Curfew & Terms</span>
                          <input
                            type="text"
                            placeholder="e.g. 10PM Curfew"
                            value={formData.curfew}
                            onChange={(e) => setFormData({...formData, curfew: e.target.value})}
                            className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                          />
                        </div>
                      </div>

                      {/* Inherited Rules Section (Read Only) */}
                      {inheritedRules.length > 0 && (
                        <div className="px-4 py-4 bg-primary/5 border-t border-gray-100">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="p-2.5 bg-white rounded-xl text-primary shadow-sm">
                              <Heart className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Inherited Master Rules</span>
                          </div>
                          <div className="space-y-2 pl-12">
                            {inheritedRules.map((rule, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-secondary mt-0.5 shrink-0" />
                                  <p className="text-[10px] font-bold text-neutral-dark/70 leading-relaxed uppercase tracking-wider">{rule.rule_text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-400 py-3.5 rounded-xl font-bold transition-all"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={isLoading || (mode === "edit" ? previews.length === 0 : photos.length === 0)}
                      className="flex-[2] bg-primary hover:opacity-90 active:scale-[0.88] text-white py-4 rounded-xl font-black text-md shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {mode === "edit" ? "Saving..." : "Publishing..."}
                        </>
                      ) : (
                        <>
                          {mode === "edit" ? "Save Changes" : "Publish Listing"}
                          <ChevronRight className="w-6 h-6" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </form>
      )}
      
      
      <StatusModal 
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => {
          if (statusModal.type === 'success') {
            router.push('/owner/listings');
          } else {
            setStatusModal(prev => ({ ...prev, isOpen: false }));
          }
        }}
        onAction={() => {
          if (statusModal.type === 'success') {
            router.push('/owner/listings');
          } else {
            setStatusModal(prev => ({ ...prev, isOpen: false }));
          }
        }}
        actionText={statusModal.type === 'success' ? 'View My Listings' : 'Try Again'}
      />
    </div>
  );
}

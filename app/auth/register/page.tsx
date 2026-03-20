'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building, ChevronRight, ArrowLeft } from 'lucide-react';
import LegalModal from '@/app/components/auth/LegalModal';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import StatusModal from '@/app/components/auth/StatusModal';
import AuthLoading from './Loading';

export default function RegisterPage() {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: null,
    title: '',
    message: '',
  });
  
  const checkRequirements = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateEmail(formData.email)) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Passwords Mismatch',
        message: 'The passwords you entered do not match. Please try again.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      });

      if (response.ok) {
        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Welcome!',
          message: 'Your account has been created successfully. Welcome to Tuloy PH!',
        });
      } else {
        const errorData = await response.json();
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Registration Failed',
          message: errorData.error || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      console.error(error);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'A network error occurred. Please check your connection.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) return <AuthLoading />;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-white font-sans">
      {/* 1. Locked Brand Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/backgrounds/tuloyphloginbg.svg"
          alt="Tuloy PH Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* 2. Scrollable Content Layer */}
      <div className="relative z-10 h-full overflow-y-auto scrollbar-hide">
        <div className="min-h-full flex flex-col items-center justify-center px-6 py-8 md:py-16">
          
          <div className="w-full max-w-md">
            {/* Header Section */}
            <div className="w-full mb-10 text-left">
                <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary mb-6 transition-all rounded-full font-bold group border border-gray-100"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[10px] uppercase tracking-widest">Back to home</span>
            </Link>
              <div className="space-y-1">
                <p className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Join the Community</p>
                <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Create Account</h1>
              </div>
            </div>

            {/* Role Selector Dashboard Style */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <button
            onClick={() => setRole('user')}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
              role === 'user'
                ? 'bg-white border-primary shadow-sm'
                : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${role === 'user' ? 'bg-primary text-white' : 'bg-white text-gray-300'}`}>
              <User className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className={`text-xs font-extrabold leading-none ${role === 'user' ? 'text-gray-900' : 'text-gray-400'}`}>User</p>
              <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Resident</p>
            </div>
          </button>

          <button
            onClick={() => setRole('owner')}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
              role === 'owner'
                ? 'bg-white border-secondary shadow-sm'
                : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${role === 'owner' ? 'bg-secondary text-white' : 'bg-white text-gray-300'}`}>
              <Building className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className={`text-xs font-extrabold leading-none ${role === 'owner' ? 'text-gray-900' : 'text-gray-400'}`}>Owner</p>
              <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Landlord</p>
            </div>
          </button>
        </div>

            {/* Form Card */}
            <div className="w-full bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col">
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">First Name</span>
                      <input
                        type="text"
                        required
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Name</span>
                      <input
                        type="text"
                        required
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <Mail className={`w-5 h-5 transition-colors ${
                      formData.email.length > 0
                        ? (validateEmail(formData.email) ? 'text-secondary' : 'text-primary')
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                      className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <Lock className={`w-5 h-5 transition-colors ${
                      formData.password.length > 0 
                        ? (Object.values(checkRequirements(formData.password)).every(Boolean) ? 'text-secondary' : 'text-primary')
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                    />
                  </div>
                </div>
                     {/* Real-time Password Requirements */}
                  <div className="p-4 bg-gray-50/50 border-b border-gray-100 space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Security Standards</p>
                      <span className={`text-[9px] font-bold uppercase ${
                        Object.values(checkRequirements(formData.password)).every(Boolean) ? 'text-secondary' : 'text-primary/60'
                      }`}>
                        {Math.round((Object.values(checkRequirements(formData.password)).filter(Boolean).length / 4) * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 px-1">
                      {[
                        { key: 'length', label: '8+ Characters' },
                        { key: 'uppercase', label: 'Upper Case' },
                        { key: 'number', label: 'One Number' },
                        { key: 'special', label: 'Special Char' },
                      ].map((req) => {
                        const isMet = checkRequirements(formData.password)[req.key as keyof ReturnType<typeof checkRequirements>];
                        return (
                          <div key={req.key} className="flex items-center gap-2">
                             <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                              isMet ? 'bg-secondary text-white' : 'bg-gray-200 text-transparent'
                            }`}>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </div>
                            <span className={`text-[10px] font-bold transition-all ${isMet ? 'text-gray-900' : 'text-gray-400'}`}>
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="p-2.5 bg-gray-50 rounded-xl">
                      <Lock className={`w-5 h-5 transition-colors ${
                        formData.confirmPassword.length > 0 
                          ? (formData.password === formData.confirmPassword ? 'text-secondary' : 'text-primary')
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confirm Password</span>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                    <p className="text-[10px] font-bold text-primary px-5 py-2 bg-primary/5">Passwords do not match yet</p>
                  )}

                <div className="flex items-start gap-3 py-2 px-1 ml-6">
                  <input type="checkbox" required className="mt-1 w-5 h-5 accent-primary rounded-xl border-none" />
                  <p className="text-xs text-neutral-dark/60 leading-relaxed font-medium">
                    I agree to the <button type="button" onClick={() => setModalType('terms')} className="text-primary font-bold hover:underline">Terms</button> and <button type="button" onClick={() => setModalType('privacy')} className="text-primary font-bold hover:underline">Privacy Policy</button>
                  </p>
                </div>

                <div className="p-4 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full ${role === 'user' ? 'bg-primary shadow-primary/20' : 'bg-secondary shadow-secondary/20'} hover:opacity-90 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2`}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </form>

              <div className="py-4 text-center border-t border-neutral-dark/5">
                <p className="text-neutral-dark/60 text-xs font-medium">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary font-bold hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer info or Logo */}
            <div className="mt-12 transition-all cursor-pointer flex justify-end">
              <Image
                src="/logo/tuloyphlogolandscape.svg"
                alt="Tuloy PH"
                width={120}
                height={60}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legal Modals */}
      <LegalModal
        isOpen={modalType === 'terms'}
        onClose={() => setModalType(null)}
        title="Terms of Service"
        content={
          <div className="space-y-4">
            <p className="text-gray-500 leading-relaxed font-medium">Welcome to Tuloy PH. By using our services, you agree to the following terms and conditions:</p>
            
            <div className="space-y-4">
              {[
                { 
                  id: "01", 
                  title: "Acceptance", 
                  desc: "By creating an account, you agree to provide accurate and complete information. You are responsible for account security." 
                },
                { 
                  id: "02", 
                  title: "Our Services", 
                  desc: "Tuloy PH is a platform connecting users across the application. We do not own or manage properties directly." 
                },
                { 
                  id: "03", 
                  title: "User Conduct", 
                  desc: "Users must use the platform for housing purposes only. Fake listings or harassment will result in account termination." 
                }
              ].map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 flex gap-4">
                  <span className="text-primary font-bold text-xs opacity-40">{item.id}</span>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{item.title}</h4>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-100" />
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Updated Mar 15, 2026</p>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
          </div>
        }
      />

      <LegalModal
        isOpen={modalType === 'privacy'}
        onClose={() => setModalType(null)}
        title="Privacy Policy"
        content={
          <div className="space-y-4">
            <p className="text-gray-500 leading-relaxed font-medium">Your privacy is important to us. This policy outlines how Tuloy PH handles your data:</p>
            
            <div className="space-y-4">
              {[
                { 
                  id: "01", 
                  title: "Data Collection", 
                  desc: "We collect your name, email, and role to facilitate communication effectively." 
                },
                { 
                  id: "02", 
                  title: "Data Usage", 
                  desc: "Your data is used solely for inquiries and verification. We never sell your personal data to third parties." 
                },
                { 
                  id: "03", 
                  title: "Security Measures", 
                  desc: "We implement modern encryption and security measures. Please use a unique, strong password for your account." 
                }
              ].map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 flex gap-4 transition-colors hover:bg-gray-50">
                  <span className="text-secondary font-bold text-xs opacity-40">{item.id}</span>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{item.title}</h4>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-100" />
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Updated Mar 15, 2026</p>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
          </div>
        }
      />

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onAction={() => {
          if (statusModal.type === 'success') {
            router.push('/auth/login');
          } else {
            setStatusModal({ ...statusModal, isOpen: false });
          }
        }}
      />

    </div>
  );
}

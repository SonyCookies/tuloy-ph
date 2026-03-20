'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ChevronRight, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import StatusModal from '@/app/components/auth/StatusModal';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AuthLoading from './Loading';

export default function LoginPage() {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Login Failed',
          message: error.message,
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Fetch DB profile to get accurate role and onboarding status
        const { data: profile } = await supabase
          .from('User')
          .select('role, onboarding_complete')
          .eq('id', data.user.id)
          .single();
        
        const role = profile?.role || data.user.user_metadata?.role;
        const onboardingDone = profile?.onboarding_complete;

        setStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Welcome Back!',
          message: 'Signing you in...',
        });

        setTimeout(() => {
          const targetPath = role === 'owner' 
            ? (onboardingDone ? '/owner' : '/owner/onboarding')
            : (onboardingDone ? '/user' : '/user/onboarding');
          
          window.location.href = targetPath;
        }, 1200);
      }
    } catch (error: any) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'A network error occurred. Please try again.',
      });
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
                <p className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Secure Access</p>
                <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Welcome Back</h1>
              </div>
            </div>

            {/* Login Form Card */}
            <div className="w-full bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden flex flex-col">
              <form onSubmit={handleSubmit} className="flex flex-col">
                {/* Email Field - Search Card Style */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <Mail className={`w-5 h-5 transition-colors ${
                      email.length > 0
                        ? (validateEmail(email) ? 'text-secondary' : 'text-primary')
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                    />
                  </div>
                </div>
                  {email.length > 0 && !validateEmail(email) && (
                    <p className="text-[10px] font-bold text-primary px-5 py-2 bg-primary/5">Please enter a valid email address</p>
                  )}

                {/* Password Field - Search Card Style */}
                <div className="px-4 py-3 flex items-center gap-4 hover:bg-gray-100 transition-colors">
                  <div className="p-2.5 bg-gray-50 rounded-xl">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-transparent text-sm font-bold text-gray-900 border-none outline-none p-0 focus:ring-0 w-full placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div className="p-4 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:opacity-90 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      "Log In"
                    )}
                  </button>
                </div>
              </form>

              <div className="py-4 text-center border-t border-neutral-dark/5">
                <p className="text-neutral-dark/60 text-xs font-medium">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                    Register for free
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
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onAction={() => setStatusModal({ ...statusModal, isOpen: false })}
      />
    </div>
  );
}
